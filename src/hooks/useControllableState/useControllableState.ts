import { useInsertionEffect, useRef, useState } from 'react';
import useStableCallback from '../useStableCallback';
import type {
  ControllableStateSetter,
  UseControllableStateOptions,
} from './types';

/**
 * 制御（`value`）と非制御（`defaultValue`）の両方で受け付ける状態を扱うhook
 *
 * - `value` が `undefined` 以外なら制御、`undefined` なら非制御として扱う。描画のたびに判定する
 * - 非制御のときは、hook が値を持つ。`defaultValue` は最初の描画でだけ使う
 * - 制御から非制御に戻ると、hook が持っている値（初期値か、非制御のときに最後に設定した値）に戻る
 * - 値を変える関数を呼ぶと、制御・非制御にかかわらず `onValueChange` を呼ぶ。
 *   今の値と `Object.is` で同じなら、何もしない
 *
 * 開閉など主な値以外の状態に使うときは、名前を付け替えて渡す
 * （`{ value: open, defaultValue: defaultOpen, onValueChange: onOpenChange }`）。
 *
 * @param options 値・初期値・値を変えたときに呼ぶ関数
 * @returns 今の値と、値を変える関数（参照は常に同じ）
 */
export default function useControllableState<T, A extends unknown[] = []>(
  options: UseControllableStateOptions<T, A> & { defaultValue: T },
): [T, ControllableStateSetter<T, A>];
export default function useControllableState<T, A extends unknown[] = []>(
  options: UseControllableStateOptions<T, A>,
): [T | undefined, ControllableStateSetter<T, A>];
export default function useControllableState<T, A extends unknown[] = []>(
  options: UseControllableStateOptions<T, A>,
): [T | undefined, ControllableStateSetter<T, A>] {
  const { value, defaultValue, onValueChange } = options;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  // 比べる相手の値。非制御のときは、同じイベントの中で続けて呼ばれても比べられるよう、設定したときにも更新する
  const latestRef = useRef(currentValue);
  useInsertionEffect(() => {
    latestRef.current = currentValue;
  });

  const setValue = useStableCallback((next: T, ...rest: A) => {
    if (Object.is(next, latestRef.current)) {
      return;
    }
    if (!isControlled) {
      latestRef.current = next;
      setUncontrolledValue(next);
    }
    onValueChange?.(next, ...rest);
  });

  return [currentValue, setValue];
}
