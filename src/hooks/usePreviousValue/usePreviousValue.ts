import { useState } from 'react';
import type { UsePreviousValueOptions } from './types';

/**
 * 前回の値を返すhook
 *
 * 値が変わったときに、レンダリング中のステート更新で前回値を更新する。
 * 比較が毎回falseになる値（レンダリング中に作るオブジェクトや配列など）を渡すと
 * 再レンダリングが止まらなくなるため、参照が安定した値を渡すか、`isEqual`を指定すること。
 *
 * @param value 現在の値
 * @param options オプション
 * @returns 前回の値。値が一度も変わっていない場合は`initialValue`
 */
export default function usePreviousValue<T = unknown>(
  value: T,
  options: UsePreviousValueOptions<T> = {},
): T | undefined {
  const isEqual = options.isEqual ?? Object.is;
  const [currentValue, setCurrentValue] = useState(value);
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
