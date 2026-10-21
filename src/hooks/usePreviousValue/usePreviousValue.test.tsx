import { renderHook } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import usePreviousValue from './usePreviousValue';

describe('usePreviousValue', () => {
  it('初回レンダーではinitialValueを返す', () => {
    const { result } = renderHook(() =>
      usePreviousValue('a', { initialValue: 'init' }),
    );

    expect(result.current).toBe('init');
  });

  it('値が変化すると、変化前の値を返すようになる', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => usePreviousValue(value),
      { initialProps: { value: 'a' } },
    );
    expect(result.current).toBeUndefined();

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    rerender({ value: 'c' });
    expect(result.current).toBe('b');
  });

  it('同じ値で再レンダーしても前回値は変わらない', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => usePreviousValue(value),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    rerender({ value: 'b' });
    expect(result.current).toBe('a');
  });

  it('isEqualで「変化なし」と判定された間は前回値が更新されない', () => {
    const isEqual = (oldValue: number, newValue: number) =>
      Math.floor(oldValue) === Math.floor(newValue);

    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => usePreviousValue(value, { isEqual }),
      { initialProps: { value: 1.1 } },
    );
    expect(result.current).toBeUndefined();

    // 整数部が同じなので「変化なし」扱いとなり、内部の現在値は1.1のまま更新されない
    rerender({ value: 1.9 });
    expect(result.current).toBeUndefined();

    // 整数部が変わったので更新される(前回値は最後に確定していた1.1)
    rerender({ value: 2.1 });
    expect(result.current).toBe(1.1);
  });

  it('NaNを渡しても再レンダリングが止まる', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => usePreviousValue(value),
      { initialProps: { value: NaN } },
    );
    expect(result.current).toBeUndefined();

    rerender({ value: NaN });
    expect(result.current).toBeUndefined();

    rerender({ value: 1 });
    expect(result.current).toBeNaN();
  });

  it('値が変わらなければ、マウント時に余分なレンダリングをしない', () => {
    let renderCount = 0;
    renderHook(() => {
      renderCount += 1;
      return usePreviousValue('a', { initialValue: 'init' });
    });

    expect(renderCount).toBe(1);
  });

  it('値が変化してもコミット回数は外部からのレンダー要求の回数と一致する', () => {
    let commitCount = 0;
    const { rerender } = renderHook(
      ({ value }: { value: number }) => {
        const prev = usePreviousValue(value);
        useEffect(() => {
          commitCount += 1;
        });
        return prev;
      },
      { initialProps: { value: 1 } },
    );
    expect(commitCount).toBe(1);

    rerender({ value: 2 });
    expect(commitCount).toBe(2);

    rerender({ value: 2 });
    expect(commitCount).toBe(3);
  });
});
