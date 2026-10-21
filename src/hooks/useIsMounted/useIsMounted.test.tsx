import { renderHook } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import { describe, expect, it } from 'vitest';
import useIsMounted from './useIsMounted';

describe('useIsMounted', () => {
  it('マウント後はtrue、アンマウント後はfalseを返す', () => {
    const { result, unmount } = renderHook(() => useIsMounted());
    expect(result.current()).toBe(true);

    unmount();
    expect(result.current()).toBe(false);
  });

  it('レンダリング中はfalse、useLayoutEffectの中ではtrueを返す', () => {
    const values: boolean[] = [];
    renderHook(() => {
      const isMounted = useIsMounted();
      values.push(isMounted());
      useLayoutEffect(() => {
        values.push(isMounted());
      }, [isMounted]);
    });

    expect(values).toEqual([false, true]);
  });

  it('再レンダリングしても同じ関数を返す', () => {
    const { result, rerender } = renderHook(() => useIsMounted());
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);
  });
});
