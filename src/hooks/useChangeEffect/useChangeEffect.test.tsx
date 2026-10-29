import { act, renderHook } from '@testing-library/react';
import { StrictMode, useLayoutEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import useChangeLayoutEffect from '../useChangeLayoutEffect';
import useExecutionAt from '../useExecutionAt';
import type { ChangeDependencies } from './types';
import useChangeEffect from './useChangeEffect';

type Props = {
  dependencies: ChangeDependencies | undefined;
  callback: () => void;
};

describe.each([
  ['useChangeEffect', useChangeEffect],
  ['useChangeLayoutEffect', useChangeLayoutEffect],
] as const)('%s', (_, useHook) => {
  const renderWith = (initialProps: Props) =>
    renderHook(
      ({ dependencies, callback }: Props) => {
        useHook(dependencies, callback);
      },
      { initialProps },
    );

  it('初回は実行しない', () => {
    const callback = vi.fn();
    renderWith({ dependencies: { a: 1 }, callback });

    expect(callback).not.toHaveBeenCalled();
  });

  it('その場で作ったオブジェクトでも、値が同じなら実行しない', () => {
    const callback = vi.fn();
    const { rerender } = renderWith({
      dependencies: { a: 1, b: 'x' },
      callback,
    });

    rerender({ dependencies: { a: 1, b: 'x' }, callback });
    rerender({ dependencies: { b: 'x', a: 1 }, callback });

    expect(callback).not.toHaveBeenCalled();
  });

  it('プロパティの値が変わったら、変わるたびに実行する', () => {
    const callback = vi.fn();
    const { rerender } = renderWith({ dependencies: { a: 1 }, callback });

    rerender({ dependencies: { a: 2 }, callback });
    rerender({ dependencies: { a: 2 }, callback });
    rerender({ dependencies: { a: 3 }, callback });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('Object.is で比べる（NaN は同じ、0 と -0 は違う）', () => {
    const callback = vi.fn();
    const { rerender } = renderWith({ dependencies: { a: NaN }, callback });

    rerender({ dependencies: { a: NaN }, callback });
    expect(callback).not.toHaveBeenCalled();

    rerender({ dependencies: { a: 0 }, callback });
    rerender({ dependencies: { a: -0 }, callback });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('比べるのは1段目だけで、オブジェクトの値は参照で比べる', () => {
    const callback = vi.fn();
    const shared = { x: 1 };
    const { rerender } = renderWith({
      dependencies: { style: shared },
      callback,
    });

    rerender({ dependencies: { style: shared }, callback });
    expect(callback).not.toHaveBeenCalled();

    rerender({ dependencies: { style: { x: 1 } }, callback });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('プロパティが増えた・減ったら実行する', () => {
    const callback = vi.fn();
    const { rerender } = renderWith({ dependencies: { a: 1 }, callback });

    rerender({ dependencies: { a: 1, b: 2 }, callback });
    rerender({ dependencies: { a: 1 }, callback });
    // 値が undefined でも、キーがあれば別のものとみなす
    rerender({ dependencies: { a: 1, b: undefined }, callback });

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('undefined はプロパティの無いオブジェクトとして扱う', () => {
    const callback = vi.fn();
    const { rerender } = renderWith({ dependencies: undefined, callback });

    rerender({ dependencies: {}, callback });
    rerender({ dependencies: undefined, callback });
    expect(callback).not.toHaveBeenCalled();

    rerender({ dependencies: { a: 1 }, callback });
    rerender({ dependencies: undefined, callback });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('コールバックの参照が変わっても実行せず、次の変化では最新のコールバックを呼ぶ', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderWith({
      dependencies: { a: 1 },
      callback: first,
    });

    rerender({ dependencies: { a: 1 }, callback: second });
    rerender({ dependencies: { a: 2 }, callback: second });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('StrictMode でも、マウントでは実行せず、1回の変化につき1回だけ実行する', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ value }: { value: number }) => {
        useHook({ value }, callback);
      },
      { initialProps: { value: 1 }, wrapper: StrictMode },
    );

    expect(callback).not.toHaveBeenCalled();

    rerender({ value: 2 });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('Execution Request を入れると、要求のたびに実行する', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => {
      const [refreshAt, refresh] = useExecutionAt();
      useHook({ refreshAt }, callback);
      return refresh;
    });

    act(() => {
      result.current();
    });
    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });
});

describe('実行のタイミング', () => {
  it('useChangeLayoutEffect はレイアウトの副作用、useChangeEffect は通常の副作用で実行する', () => {
    const order: string[] = [];
    const { rerender } = renderHook(
      ({ value }: { value: number }) => {
        useChangeEffect({ value }, () => {
          order.push('effect');
        });
        useChangeLayoutEffect({ value }, () => {
          order.push('layout');
        });
        useLayoutEffect(() => {
          if (value > 1) {
            order.push('other layout');
          }
        });
      },
      { initialProps: { value: 1 } },
    );

    rerender({ value: 2 });

    expect(order).toEqual(['layout', 'other layout', 'effect']);
  });
});
