import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useConstant from './useConstant';

describe('useConstant', () => {
  it('factoryで作成した値を返す', () => {
    const { result } = renderHook(() => useConstant(() => 'value'));
    expect(result.current).toBe('value');
  });

  it('再レンダリングしても同じ値を返し、factoryは一度だけ呼ばれる', () => {
    const factory = vi.fn(() => ({}));
    const { result, rerender } = renderHook(() => useConstant(factory));
    const first = result.current;

    rerender();
    rerender();
    expect(result.current).toBe(first);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('関数を値として保持できる', () => {
    const fn = () => 'fn';
    const { result } = renderHook(() => useConstant(() => fn));
    expect(result.current).toBe(fn);
  });
});
