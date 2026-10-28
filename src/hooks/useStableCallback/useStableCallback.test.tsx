import { act, renderHook } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import useStableCallback from './useStableCallback';

describe('useStableCallback', () => {
  it('返す関数の参照は、コールバックが変わっても変わらない', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useStableCallback(() => value),
      { initialProps: { value: 1 } },
    );
    const first = result.current;

    rerender({ value: 2 });

    expect(result.current).toBe(first);
  });

  it('最後にコミットしたコールバックを、引数と戻り値をそのままにして呼ぶ', () => {
    const { result, rerender } = renderHook(
      ({ base }) => useStableCallback((a: number, b: number) => base + a + b),
      { initialProps: { base: 100 } },
    );

    expect(result.current(1, 2)).toBe(103);

    rerender({ base: 200 });

    expect(result.current(1, 2)).toBe(203);
  });

  it('エフェクトの中から呼ぶと、同じレンダリングのコールバックが呼ばれる', () => {
    const calls: number[] = [];
    const { rerender } = renderHook(
      ({ value }) => {
        const callback = useStableCallback(() => value);
        useEffect(() => {
          calls.push(callback());
        });
      },
      { initialProps: { value: 1 } },
    );

    act(() => {
      rerender({ value: 2 });
    });

    expect(calls).toEqual([1, 2]);
  });
});
