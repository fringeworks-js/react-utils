import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useExecutionMark from './useExecutionMark';

describe('useExecutionMark', () => {
  it('初期状態は 0', () => {
    const { result } = renderHook(() => useExecutionMark());

    expect(result.current[0]).toBe(0);
  });

  it('execute を呼ぶたびに、前回と異なる値になる', () => {
    const { result } = renderHook(() => useExecutionMark());

    act(() => {
      result.current[1]();
    });
    const first = result.current[0];
    act(() => {
      result.current[1]();
    });
    const second = result.current[0];

    expect(first).toBeGreaterThan(0);
    expect(second).not.toBe(first);
  });

  it('execute の参照は再レンダリングをまたいで変わらない', () => {
    const { result, rerender } = renderHook(() => useExecutionMark());
    const execute = result.current[1];

    act(() => {
      execute();
    });
    rerender();

    expect(result.current[1]).toBe(execute);
  });
});
