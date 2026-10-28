import { act, render, renderHook } from '@testing-library/react';
import { StrictMode, useLayoutEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ExecutionRequest } from '../useExecutionAt';
import useExecutionAt from '../useExecutionAt';
import useExecutionLayoutEffect from '../useExecutionLayoutEffect';
import useExecutionEffect from './useExecutionEffect';

type Hook = typeof useExecutionEffect;

/**
 * 呼び出す側と受け取る側を1つの hook で動かす
 */
const renderPair = (useHook: Hook, callback: (payload?: string) => void) =>
  renderHook(
    ({ cb }) => {
      const [request, execute] = useExecutionAt<string>();
      useHook(request, cb);
      return { request, execute };
    },
    { initialProps: { cb: callback } },
  );

describe.each([
  ['useExecutionEffect', useExecutionEffect],
  ['useExecutionLayoutEffect', useExecutionLayoutEffect],
] as const)('%s', (_, useHook) => {
  it('初期状態（at: 0）では実行しない', () => {
    const callback = vi.fn();
    renderPair(useHook, callback);

    expect(callback).not.toHaveBeenCalled();
  });

  it('要求するたびに payload を渡して実行する', () => {
    const callback = vi.fn();
    const { result } = renderPair(useHook, callback);

    act(() => {
      result.current.execute('first');
    });
    act(() => {
      result.current.execute('first');
    });
    act(() => {
      result.current.execute('second');
    });

    expect(callback.mock.calls).toEqual([['first'], ['first'], ['second']]);
  });

  it('要求が変わらない再レンダリングでは実行しない', () => {
    const callback = vi.fn();
    const { result, rerender } = renderPair(useHook, callback);

    act(() => {
      result.current.execute('a');
    });
    rerender({ cb: callback });
    rerender({ cb: callback });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('コールバックの参照が変わっても実行せず、次の要求では最新のコールバックを呼ぶ', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderPair(useHook, first);

    rerender({ cb: second });
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    act(() => {
      result.current.execute('a');
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('a');
  });

  it('次のレンダリングまでに複数回要求した場合は、最後の要求だけを実行する', () => {
    const callback = vi.fn();
    const { result } = renderPair(useHook, callback);

    act(() => {
      result.current.execute('a');
      result.current.execute('b');
    });

    expect(callback.mock.calls).toEqual([['b']]);
  });

  it('マウントより前に出た要求は実行しない', () => {
    const { result: issuer } = renderHook(() => useExecutionAt<string>());
    act(() => {
      issuer.current[1]('before');
    });
    const callback = vi.fn();

    renderHook(() => {
      useHook(issuer.current[0], callback);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('undefined は要求なしとして扱い、マウントの後に出た要求に変わったら実行する', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ request }: { request: ExecutionRequest<string> | undefined }) => {
        useHook(request, callback);
      },
      {
        initialProps: {
          request: undefined as ExecutionRequest<string> | undefined,
        },
      },
    );
    const { result: issuer } = renderHook(() => useExecutionAt<string>());
    act(() => {
      issuer.current[1]('after');
    });

    rerender({ request: issuer.current[0] });
    rerender({ request: undefined });

    expect(callback.mock.calls).toEqual([['after']]);
  });

  it('StrictMode でも1回の要求につき1回だけ実行する', () => {
    const callback = vi.fn();
    const { result } = renderHook(
      () => {
        const [request, execute] = useExecutionAt<string>();
        useHook(request, callback);
        return execute;
      },
      { wrapper: StrictMode },
    );

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      result.current('a');
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('後からマウントした子は、マウントより前の要求を実行せず、その後の要求を実行する', () => {
    const callback = vi.fn();
    let execute: (payload?: string) => void = () => {};
    let show: () => void = () => {};

    function Child({ request }: { request: ExecutionRequest<string> }) {
      useHook(request, callback);
      return null;
    }
    function Parent() {
      const [request, run] = useExecutionAt<string>();
      const [visible, setVisible] = useState(false);
      execute = run;
      show = () => {
        setVisible(true);
      };
      return visible ? <Child request={request} /> : null;
    }
    render(<Parent />);

    act(() => {
      execute('before');
    });
    act(() => {
      show();
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      execute('after');
    });
    expect(callback.mock.calls).toEqual([['after']]);
  });
});

describe('実行のタイミング', () => {
  it('useExecutionLayoutEffect はレイアウトの副作用、useExecutionEffect は通常の副作用で実行する', () => {
    const order: string[] = [];
    const { result } = renderHook(() => {
      const [request, execute] = useExecutionAt();
      useExecutionEffect(request, () => {
        order.push('effect');
      });
      useExecutionLayoutEffect(request, () => {
        order.push('layout');
      });
      useLayoutEffect(() => {
        if (request.at > 0) {
          order.push('other layout');
        }
      });
      return execute;
    });

    act(() => {
      result.current();
    });

    expect(order).toEqual(['layout', 'other layout', 'effect']);
  });
});
