import { playInterpolator } from '@fringeworks/web-utils';
import { useEffect, useRef, useState } from 'react';
import useLatestRef from '../useLatestRef/useLatestRef';
import type { UseAnimationEffectOptions } from './types';

// 数値を線形に補間する
const interpolateNumber = (a: number, b: number) => (t: number) =>
  a + (b - a) * t;

/**
 * 値が変わったときに、前の値から新しい値へアニメーションし、途中の値をフレームごとにコールバックに渡すhook
 *
 * 途中の値ではレンダリングしないので、DOM に直接書くなど、React を通さずに表示を変えるときに使う。
 * 戻り値は最後まで再生し終えた値で、再生している間は前の値のまま。最後まで再生したときにだけ再レンダリングする。
 * アニメーションの途中で値が変わった場合は、その時点の途中の値から新しい値へ再生し直す（戻り値は変わらない）。
 * 再生には web-utils の `playInterpolator`（requestAnimationFrame）を使う。
 * `interpolate`・`duration`・`ease` は再生を始めるときの値を使い、変えても再生し直さない。
 * 比較が毎回falseになる値（レンダリング中に作るオブジェクトや配列など）を渡すと
 * 再レンダリングが止まらなくなるため、参照が安定した値を渡すか、`isEqual`を指定すること。
 *
 * @param value 新しい値
 * @param callback フレームごとに途中の値を受け取る関数
 * @param options オプション。数値以外の値では `interpolate` が必須
 * @returns 最後まで再生し終えた値（interpolator が `t` = 1 で返した値）。初回は `value`（`initialValue` を指定した場合はそれ）
 */
function useAnimationEffect(
  value: number,
  callback: (value: number) => void,
  options?: UseAnimationEffectOptions<number>,
): number;
function useAnimationEffect<T>(
  value: T,
  callback: (value: T) => void,
  options: UseAnimationEffectOptions<T> &
    Required<Pick<UseAnimationEffectOptions<T>, 'interpolate'>>,
): T;
function useAnimationEffect<T>(
  value: T,
  callback: (value: T) => void,
  options: UseAnimationEffectOptions<T> = {},
): T {
  const isEqual = options.isEqual ?? Object.is;
  const [target, setTarget] = useState(value);
  const [settledValue, setSettledValue] = useState(() =>
    options.initialValue !== undefined ? options.initialValue : value,
  );
  // 再生を始めるときに、その時点の値（途中なら途中の値）を読むための参照（コールバックの中でだけ書き換える）
  const currentRef = useRef(settledValue);
  const callbackRef = useLatestRef(callback);
  const optionsRef = useLatestRef(options);

  // レンダリング中にsetStateすることで、値が変わった際に余分なコミットを挟まずに目標の値を更新する
  if (!isEqual(target, value)) {
    setTarget(value);
  }

  useEffect(() => {
    const {
      interpolate = interpolateNumber as unknown as NonNullable<
        UseAnimationEffectOptions<T>['interpolate']
      >,
      duration,
      ease,
      isEqual: isEqualLatest = Object.is,
    } = optionsRef.current;
    const from = currentRef.current;
    // 今の値が目標の値なら再生しない（マウントしたとき（initialValue が無い場合）や、
    // 再生の途中で、ちょうどその時点の値に変わったとき）。
    // 途中の値で止まっている場合もあるので、今の値を戻り値に反映する（同じなら前の値を返して更新を省く）
    if (isEqualLatest(from, target)) {
      setSettledValue((prev) => (isEqualLatest(prev, from) ? prev : from));
      return;
    }
    let last = from;
    return playInterpolator(
      interpolate(from, target),
      (next) => {
        last = next;
        currentRef.current = next;
        callbackRef.current(next);
      },
      { duration, ease, onFinish: () => setSettledValue(() => last) },
    );
  }, [target, callbackRef, optionsRef]);

  return settledValue;
}

export default useAnimationEffect;
