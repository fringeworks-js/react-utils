import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useRerender from './useRerender';

describe('useRerender', () => {
  it('呼ぶと再レンダリングする', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useRerender();
    });
    const before = renders;

    act(() => {
      result.current();
    });

    expect(renders).toBe(before + 1);
  });

  it('返す関数の参照は再レンダリングをまたいで変わらない', () => {
    const { result, rerender } = renderHook(() => useRerender());
    const first = result.current;

    act(() => {
      result.current();
    });
    rerender();

    expect(result.current).toBe(first);
  });
});
