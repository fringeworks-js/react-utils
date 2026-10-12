import { useState } from 'react';
import type { UsePreviousValueOptions } from './types';

// 単純な比較用の関数
const defaultIsEqual = (oldValue: unknown, newValue: unknown) =>
  oldValue === newValue;

/**
 * 前回の値を返すhook
 * @param value 現在の値
 * @param options オプション
 * @returns 前回の値
 */
export default function usePreviousValue<T = unknown>(
  value: T,
  options: UsePreviousValueOptions<T> = {},
): T | undefined {
  const isEqual = options.isEqual ?? defaultIsEqual;
  const [currentValue, setCurrentValue] = useState(options.initialValue);
  const [prevValue, setPrevValue] = useState(options.initialValue);

  // レンダリング中にsetStateすることで、値が変わった際に余分なコミット・エフェクトの発火を挟まずに
  // 前回値を更新する(https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  if (!isEqual(currentValue, value)) {
    // レンダー中の同期処理で条件付きのステート更新は許容される
    setPrevValue(currentValue);
    setCurrentValue(value);
  }

  return prevValue;
}
