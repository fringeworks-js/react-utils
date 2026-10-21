export type UsePreviousValueOptions<T = unknown> = {
  /**
   * 値が一度も変わっていない間に返す値
   */
  initialValue?: T;

  /**
   * 値の比較関数
   * falseの場合に値を更新する
   * 未指定の場合は`Object.is`で比較
   * @param oldValue 最後に確定した値
   * @param newValue 現在の値
   * @returns 同じ値とみなす場合はtrue
   */
  isEqual?: (oldValue: T, newValue: T) => boolean;
};
