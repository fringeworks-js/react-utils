/**
 * `useAnimationEffect` のオプション
 */
export type UseAnimationEffectOptions<T> = {
  /**
   * 2つの値から、`t`（0 〜 1）に応じた値を返す関数（interpolator）を作る関数。
   * d3-interpolate の `interpolate` や `interpolateRgb`、@fringeworks/interpolate の関数を包んだものなどを渡せる。
   * 数値の場合は省略でき、省略すると線形に補間する
   * @param a 再生を始める時点の値（途中で値が変わった場合は、その時点の途中の値）
   * @param b 新しい値
   * @returns `t` に応じた値を返す関数
   */
  interpolate?: (a: T, b: T) => (t: number) => T;

  /**
   * 再生する時間（ミリ秒）。`NaN` や負の値は 0 として扱う
   *
   * @default 250
   */
  duration?: number;

  /**
   * 経過時間の割合（0 〜 1）に適用するイージング関数。未指定の場合は線形
   */
  ease?: (t: number) => number;

  /**
   * マウントしたときの値。指定すると、この値から `value` へ再生する
   */
  initialValue?: T;

  /**
   * 値の比較関数。未指定の場合は `Object.is` で比較する
   * @param oldValue 前の値
   * @param newValue 新しい値
   * @returns 同じ値とみなす場合は true
   */
  isEqual?: (oldValue: T, newValue: T) => boolean;
};
