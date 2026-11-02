import { act, renderHook } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { ControllableStateSetter } from './types';
import useControllableState from './useControllableState';

describe('useControllableState', () => {
  describe('非制御', () => {
    it('defaultValue を初期値にし、設定した値を持つ', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 1 }),
      );

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1](2);
      });

      expect(result.current[0]).toBe(2);
    });

    it('defaultValue が後から変わっても反映しない', () => {
      const { result, rerender } = renderHook(
        ({ defaultValue }) => useControllableState({ defaultValue }),
        { initialProps: { defaultValue: 1 } },
      );

      rerender({ defaultValue: 2 });

      expect(result.current[0]).toBe(1);
    });

    it('値を変えると onValueChange を呼ぶ', () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 1, onValueChange }),
      );

      act(() => {
        result.current[1](2);
      });

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(2);
    });

    it('どちらも渡さないときは undefined', () => {
      const { result } = renderHook(() => useControllableState<number>({}));

      expect(result.current[0]).toBeUndefined();

      act(() => {
        result.current[1](1);
      });

      expect(result.current[0]).toBe(1);
    });

    it('同じイベントの中で続けて呼んでも、直前に設定した値と比べる', () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 1, onValueChange }),
      );

      act(() => {
        result.current[1](2);
        result.current[1](1);
      });

      expect(onValueChange.mock.calls).toEqual([[2], [1]]);
      expect(result.current[0]).toBe(1);
    });
  });

  describe('制御', () => {
    it('value を返し、値を変えても親が value を変えるまでは変わらない', () => {
      const onValueChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ value }) => useControllableState({ value, onValueChange }),
        { initialProps: { value: 1 } },
      );

      act(() => {
        result.current[1](2);
      });

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(2);
      expect(result.current[0]).toBe(1);

      rerender({ value: 2 });

      expect(result.current[0]).toBe(2);
    });

    it('defaultValue より value を優先する', () => {
      const { result } = renderHook(() =>
        useControllableState({ value: 1, defaultValue: 2 }),
      );

      expect(result.current[0]).toBe(1);
    });

    it('null は空の値として制御に含める', () => {
      const { result } = renderHook(() =>
        useControllableState<string | null>({ value: null, defaultValue: 'a' }),
      );

      expect(result.current[0]).toBeNull();
    });

    it('親が値を変えなかったときは、同じ値をもう一度設定しても通知する', () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ value: 1, onValueChange }),
      );

      act(() => {
        result.current[1](2);
      });
      act(() => {
        result.current[1](2);
      });

      expect(onValueChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('制御と非制御の切り替え', () => {
    it('value が undefined から値になると制御になる', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value?: number }) =>
          useControllableState({ value, defaultValue: 0 }),
        { initialProps: {} },
      );

      expect(result.current[0]).toBe(0);

      rerender({ value: 5 });

      expect(result.current[0]).toBe(5);
    });

    it('制御から非制御に戻ると、hook が持っている値に戻る', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value?: number }) =>
          useControllableState({ value, defaultValue: 0 }),
        { initialProps: { value: 5 } as { value?: number } },
      );

      rerender({});

      expect(result.current[0]).toBe(0);
    });
  });

  describe('通知', () => {
    it('今の値と Object.is で同じなら通知しない', () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ value: NaN, onValueChange }),
      );

      act(() => {
        result.current[1](NaN);
      });

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('2つ目以降の引数を、そのまま onValueChange に渡す', () => {
      const onValueChange = vi.fn(
        (_value: readonly string[], _details?: { type: string }) => {},
      );
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: [] as string[], onValueChange }),
      );

      act(() => {
        result.current[1](['a'], { type: 'add' });
      });

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(['a'], {
        type: 'add',
      });
    });

    it('値を変える関数の参照は、描画しても変わらない', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useControllableState({ value }),
        { initialProps: { value: 1 } },
      );
      const first = result.current[1];

      rerender({ value: 2 });

      expect(result.current[1]).toBe(first);
    });

    it('最後にコミットした onValueChange を呼ぶ', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { result, rerender } = renderHook(
        ({ onValueChange }) =>
          useControllableState({ defaultValue: 1, onValueChange }),
        { initialProps: { onValueChange: first } },
      );

      rerender({ onValueChange: second });
      act(() => {
        result.current[1](2);
      });

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledExactlyOnceWith(2);
    });
  });

  describe('型', () => {
    it('defaultValue を渡すと T、渡さないと T | undefined を返す', () => {
      const { result: withDefault } = renderHook(() =>
        useControllableState({
          value: undefined as readonly string[] | undefined,
          defaultValue: [],
        }),
      );
      const { result: withoutDefault } = renderHook(() =>
        useControllableState({ value: undefined as number | undefined }),
      );

      expectTypeOf(withDefault.current[0]).toEqualTypeOf<readonly string[]>();
      expectTypeOf(withoutDefault.current[0]).toEqualTypeOf<
        number | undefined
      >();
    });

    it('onValueChange の2つ目以降の引数が、setter の引数になる', () => {
      const { result } = renderHook(() =>
        useControllableState({
          defaultValue: 0,
          onValueChange: (_value: number, _details?: { reason: string }) => {},
        }),
      );

      expectTypeOf(result.current[1]).toEqualTypeOf<
        ControllableStateSetter<number, [details?: { reason: string }]>
      >();
    });
  });
});
