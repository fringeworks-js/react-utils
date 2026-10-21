import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useStableLength from './useStableLength';

describe('useStableLength', () => {
  it('配列の要素数が変わらなければエラーにならない', () => {
    const { rerender } = renderHook(
      ({ arr }: { arr: readonly unknown[] }) => useStableLength(arr),
      { initialProps: { arr: [1, 2] } },
    );

    expect(() => rerender({ arr: [3, 4] })).not.toThrow();
  });

  it('配列の要素数が変わるとエラーになる', () => {
    const { rerender } = renderHook(
      ({ arr }: { arr: readonly unknown[] }) => useStableLength(arr),
      { initialProps: { arr: [1, 2] } },
    );

    expect(() => rerender({ arr: [1] })).toThrow(/\(2 → 1\)/);
  });
});
