import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useExecutionAt from './useExecutionAt';

describe('useExecutionAt', () => {
  it('初期状態はat:0、payloadはundefined', () => {
    const { result } = renderHook(() => useExecutionAt<string>());
    const [request] = result.current;

    expect(request.at).toBe(0);
    expect(request.payload).toBeUndefined();
  });

  it('executeを呼ぶ度にatが増加し、payloadが更新される', () => {
    const { result } = renderHook(() => useExecutionAt<string>());

    act(() => {
      result.current[1]('first');
    });
    const firstRequest = result.current[0];
    expect(firstRequest.payload).toBe('first');
    expect(firstRequest.at).toBeGreaterThan(0);

    act(() => {
      result.current[1]('second');
    });
    const secondRequest = result.current[0];
    expect(secondRequest.payload).toBe('second');
    expect(secondRequest.at).toBeGreaterThan(firstRequest.at);
  });

  it('execute関数は再レンダーを跨いで同一の参照を保つ', () => {
    const { result, rerender } = renderHook(() => useExecutionAt());
    const firstExecute = result.current[1];

    rerender();

    expect(result.current[1]).toBe(firstExecute);
  });
});
