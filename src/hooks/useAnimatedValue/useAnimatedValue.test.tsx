import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAnimatedValue from './useAnimatedValue';

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

describe('useAnimatedValue', () => {
  let frames: ReturnType<typeof setupFrames>;

  beforeEach(() => {
    frames = setupFrames();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('初回は値をそのまま返し、再生しない', () => {
    const { result } = renderHook(() => useAnimatedValue(10));
    expect(result.current).toBe(10);
    expect(frames.pendingCount).toBe(0);
  });

  it('値が変わると、前の値から新しい値へ線形に再生する', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useAnimatedValue(value, { duration: 100 }),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 100 });
    expect(result.current).toBe(0);

    frames.frame(25);
    expect(result.current).toBe(25);
    frames.frame(100);
    expect(result.current).toBe(100);
    expect(frames.pendingCount).toBe(0);
  });

  it('再生の途中で値が変わると、その時点の値から再生し直す', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useAnimatedValue(value, { duration: 100 }),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 100 });
    frames.frame(50);
    expect(result.current).toBe(50);

    rerender({ value: 0 });
    frames.frame(100);
    expect(result.current).toBe(25);
    frames.frame(150);
    expect(result.current).toBe(0);
  });

  it('再生の途中で、ちょうどその時点の値に変わると、その値で止まる', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useAnimatedValue(value, { duration: 100 }),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 100 });
    frames.frame(50);
    rerender({ value: 50 });
    expect(result.current).toBe(50);
    expect(frames.pendingCount).toBe(0);
  });

  it('initialValue を指定すると、マウントしたときに initialValue から再生する', () => {
    const { result } = renderHook(() =>
      useAnimatedValue(100, { initialValue: 0, duration: 100 }),
    );
    expect(result.current).toBe(0);
    frames.frame(50);
    expect(result.current).toBe(50);
    frames.frame(100);
    expect(result.current).toBe(100);
  });

  it('StrictMode でも initialValue から再生する', () => {
    const { result } = renderHook(
      () => useAnimatedValue(100, { initialValue: 0, duration: 100 }),
      { wrapper: StrictMode },
    );
    frames.frame(50);
    expect(result.current).toBe(50);
    expect(frames.pendingCount).toBe(1);
  });

  it('interpolate と ease で補間の仕方を変えられる', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useAnimatedValue(value, {
          duration: 100,
          ease: (t) => t * t,
          interpolate: (a, b) => (t) => (t < 0.5 ? a : b),
        }),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    frames.frame(50);
    expect(result.current).toBe('a');
    frames.frame(75);
    expect(result.current).toBe('b');
  });

  it('isEqual で同じとみなした値では再生しない', () => {
    const isEqual = (a: number[], b: number[]) => a[0] === b[0];
    const interpolate = (a: number[], b: number[]) => (t: number) => [
      a[0]! + (b[0]! - a[0]!) * t,
    ];
    const { result, rerender } = renderHook(
      ({ value }: { value: number[] }) =>
        useAnimatedValue(value, { duration: 100, interpolate, isEqual }),
      { initialProps: { value: [0] } },
    );

    rerender({ value: [0] });
    expect(frames.pendingCount).toBe(0);

    rerender({ value: [100] });
    frames.frame(50);
    expect(result.current).toEqual([50]);
  });

  it('アンマウントすると再生を止める', () => {
    const { rerender, unmount } = renderHook(
      ({ value }: { value: number }) =>
        useAnimatedValue(value, { duration: 100 }),
      { initialProps: { value: 0 } },
    );
    rerender({ value: 100 });
    expect(frames.pendingCount).toBe(1);
    unmount();
    expect(frames.pendingCount).toBe(0);
  });
});
