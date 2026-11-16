import { useState } from 'react';
import type { UseAnimationEffectOptions } from '../useAnimationEffect/types';
import useAnimationEffect from '../useAnimationEffect/useAnimationEffect';
import type { UseAnimatedValueOptions } from './types';

/**
 * 値が変わったときに、表示している値から新しい値へアニメーションし、途中の値を返すhook
 *
 * `useAnimationEffect` で再生し、途中の値をステートに入れて返す（フレームごとに再レンダリングする）。
 * 途中の値でレンダリングしたくない場合は、`useAnimationEffect` を使う。
 * アニメーションの途中で値が変わった場合は、その時点の値から新しい値へ再生し直す。
 * `interpolate`・`duration`・`ease` は再生を始めるときの値を使い、変えても再生し直さない。
 * 比較が毎回falseになる値（レンダリング中に作るオブジェクトや配列など）を渡すと
 * 再レンダリングが止まらなくなるため、参照が安定した値を渡すか、`isEqual`を指定すること。
 *
 * @param value 新しい値
 * @param options オプション。数値以外の値では `interpolate` が必須
 * @returns 表示する値
 */
function useAnimatedValue(
  value: number,
  options?: UseAnimatedValueOptions<number>,
): number;
function useAnimatedValue<T>(
  value: T,
  options: UseAnimatedValueOptions<T> &
    Required<Pick<UseAnimatedValueOptions<T>, 'interpolate'>>,
): T;
function useAnimatedValue<T>(
  value: T,
  options: UseAnimatedValueOptions<T> = {},
): T {
  const [displayValue, setDisplayValue] = useState(() =>
    options.initialValue !== undefined ? options.initialValue : value,
  );

  // 数値以外で interpolate が無い呼び出しは、オーバーロードの型で防いでいる
  useAnimationEffect(
    value,
    (next) => {
      setDisplayValue(() => next);
    },
    options as UseAnimationEffectOptions<T> &
      Required<Pick<UseAnimationEffectOptions<T>, 'interpolate'>>,
  );

  return displayValue;
}

export default useAnimatedValue;
