import { renderHook } from '@testing-library/react';
import { useEffect, useLayoutEffect } from 'react';
import { describe, expect, it } from 'vitest';
import useLatestRef from './useLatestRef';

describe('useLatestRef', () => {
  it('初期値を保持する', () => {
    const { result } = renderHook(() => useLatestRef('a'));
    expect(result.current.current).toBe('a');
  });

  it('再レンダリングしても同じ参照を返し、値は最新になる', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useLatestRef(value),
      { initialProps: { value: 'a' } },
    );
    const ref = result.current;

    rerender({ value: 'b' });
    expect(result.current).toBe(ref);
    expect(ref.current).toBe('b');
  });

  it('useLayoutEffect・useEffectの中から最新の値を参照できる', () => {
    const values: string[] = [];
    const { rerender } = renderHook(
      ({ value }: { value: string }) => {
        const ref = useLatestRef(value);
        useLayoutEffect(() => {
          values.push(`layout:${ref.current}`);
        });
        useEffect(() => {
          values.push(`effect:${ref.current}`);
        });
      },
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    expect(values).toEqual(['layout:a', 'effect:a', 'layout:b', 'effect:b']);
  });
});
