import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAnimationEffect from './useAnimationEffect';

/**
 * requestAnimationFrame と performance.now を差し替え、
 * `frame(now)` で任意の時刻のフレームを進められるようにする
 */
function setupFrames() {
  let callbacks = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  let current = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => current);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    callbacks.set(++frameId, cb);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    callbacks.delete(id);
  });
  return {
    frame(now: number) {
      current = now;
      const pending = callbacks;
      callbacks = new Map();
      act(() => {
        pending.forEach((cb) => cb(now));
      });
    },
    get pendingCount() {
      return callbacks.size;
    },
  };
}

describe('useAnimationEffect', () => {
  let frames: ReturnType<typeof setupFrames>;

  beforeEach(() => {
    frames = setupFrames();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('初回は値をそのまま返し、再生しない', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationEffect(10, callback));
    expect(result.current).toBe(10);
    expect(callback).not.toHaveBeenCalled();
    expect(frames.pendingCount).toBe(0);
  });

  it('途中の値はコールバックに渡し、再生している間は再レンダリングしない', () => {
    const callback = vi.fn();
    let renderCount = 0;
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => {
        renderCount += 1;
        return useAnimationEffect(value, callback, { duration: 100 });
      },
      { initialProps: { value: 0 } },
    );

    rerender({ value: 100 });
    const rendersBeforePlay = renderCount;

    frames.frame(25);
    expect(callback).toHaveBeenLastCalledWith(25);
    frames.frame(50);
    expect(callback).toHaveBeenLastCalledWith(50);
    expect(result.current).toBe(0);
    expect(renderCount).toBe(rendersBeforePlay);
  });

  it('最後まで再生したときに、戻り値を新しい値にする', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useAnimationEffect(value, callback, { duration: 100 }),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 100 });
    frames.frame(100);
    expect(callback).toHaveBeenLastCalledWith(100);
    expect(result.current).toBe(100);
    expect(frames.pendingCount).toBe(0);
  });

  it('戻り値は interpolator が t = 1 で返した値にする', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useAnimationEffect(value, () => {}, {
          duration: 100,
          interpolate: (a, b) => (t) => Math.round(a + (b - a) * t),
        }),
      { initialProps: { value: 0 } },
    );
    rerender({ value: 10.4 });
    frames.frame(100);
    expect(result.current).toBe(10);
  });

  it('途中で値が変わると、途中の値から再生し直し、戻り値は終わるまで変えない', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useAnimationEffect(value, callback, { duration: 100 }),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 100 });
    frames.frame(50);

    rerender({ value: 0 });
    frames.frame(100);
    expect(callback).toHaveBeenLastCalledWith(25);
    expect(result.current).toBe(0);

    rerender({ value: 200 });
    frames.frame(150);
    expect(result.current).toBe(0);
    frames.frame(250);
    expect(result.current).toBe(200);
  });

  it('途中で、ちょうどその時点の値に変わると、再生をやめて戻り値をその値にする', () => {
    const callback = vi.fn();
    let renderCount = 0;
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => {
        renderCount += 1;
        return useAnimationEffect(value, callback, { duration: 100 });
      },
      { initialProps: { value: 0 } },
    );

    rerender({ value: 100 });
    frames.frame(50);

    rerender({ value: 50 });
    expect(result.current).toBe(50);
    expect(frames.pendingCount).toBe(0);

    // 戻り値と同じ値に戻したときは、余分な再レンダリングをしない
    const rendersBefore = renderCount;
    rerender({ value: 50 });
    expect(renderCount).toBe(rendersBefore + 1);
  });

  it('initialValue を指定すると、マウントしたときに initialValue から再生する', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useAnimationEffect(100, callback, { initialValue: 0, duration: 100 }),
    );
    expect(result.current).toBe(0);
    frames.frame(50);
    expect(callback).toHaveBeenLastCalledWith(50);
    expect(result.current).toBe(0);
    frames.frame(100);
    expect(result.current).toBe(100);
  });

  it('StrictMode でも initialValue から再生する', () => {
    const callback = vi.fn();
    renderHook(
      () =>
        useAnimationEffect(100, callback, { initialValue: 0, duration: 100 }),
      { wrapper: StrictMode },
    );
    frames.frame(50);
    expect(callback).toHaveBeenCalledExactlyOnceWith(50);
    expect(frames.pendingCount).toBe(1);
  });

  it('最新のコールバックを呼ぶ', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ value, callback }: { value: number; callback: () => void }) =>
        useAnimationEffect(value, callback, { duration: 100 }),
      { initialProps: { value: 0, callback: first } },
    );
    rerender({ value: 100, callback: first });
    rerender({ value: 100, callback: second });
    frames.frame(50);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(50);
  });

  it('アンマウントすると再生を止める', () => {
    const { rerender, unmount } = renderHook(
      ({ value }: { value: number }) =>
        useAnimationEffect(value, () => {}, { duration: 100 }),
      { initialProps: { value: 0 } },
    );
    rerender({ value: 100 });
    expect(frames.pendingCount).toBe(1);
    unmount();
    expect(frames.pendingCount).toBe(0);
  });
});
