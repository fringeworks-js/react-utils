import { renderHook } from '@testing-library/react';
import { createRef, type Ref, type RefCallback } from 'react';
import { describe, expect, it, vi } from 'vitest';
import useCombinedRefs from './useCombinedRefs';

describe('useCombinedRefs', () => {
  it('渡した全てのrefに同じ値がセットされる', () => {
    const objectRef = createRef<string>();
    const callbackRef = vi.fn();

    const { result } = renderHook(() =>
      useCombinedRefs(objectRef, callbackRef),
    );
    result.current('value');

    expect(objectRef.current).toBe('value');
    expect(callbackRef).toHaveBeenCalledWith('value');
  });

  it('callback refが返したクリーンアップ関数を戻り値として返す', () => {
    const cleanup = vi.fn();
    const callbackRef = vi.fn().mockReturnValue(cleanup);

    const { result } = renderHook(() => useCombinedRefs(callbackRef));
    const returnedCleanup = result.current('value') as () => void;

    expect(typeof returnedCleanup).toBe('function');
    expect(cleanup).not.toHaveBeenCalled();

    returnedCleanup();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('クリーンアップ関数を返さないcallback refには、nullを渡すクリーンアップが生成される', () => {
    const callbackRef = vi.fn();

    const { result } = renderHook(() => useCombinedRefs(callbackRef));
    const returnedCleanup = result.current('value') as () => void;
    callbackRef.mockClear();

    returnedCleanup();
    expect(callbackRef).toHaveBeenCalledWith(null);
  });

  it('null・undefinedのrefは無視する', () => {
    const objectRef = createRef<string>();

    const { result } = renderHook(() =>
      useCombinedRefs(objectRef, null, undefined),
    );
    const cleanup = result.current('value') as () => void;

    expect(objectRef.current).toBe('value');
    cleanup();
    expect(objectRef.current).toBeNull();
  });

  it('再レンダーを跨いでも渡すrefの参照が変わらなければ同一の関数を返す', () => {
    const objectRef = createRef<string>();
    const { result, rerender } = renderHook(() => useCombinedRefs(objectRef));
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('渡すrefの数がレンダーを跨いで変化するとエラーになる', () => {
    const objectRef = createRef<string>();
    const callbackRef: RefCallback<string> = vi.fn();
    const { rerender } = renderHook(
      ({ refs }: { refs: Ref<string>[] }) => useCombinedRefs(...refs),
      { initialProps: { refs: [objectRef] as Ref<string>[] } },
    );

    expect(() => rerender({ refs: [objectRef, callbackRef] })).toThrow();
  });
});
