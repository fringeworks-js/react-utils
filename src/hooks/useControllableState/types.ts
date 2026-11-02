export type UseControllableStateOptions<T, A extends unknown[] = []> = {
  /**
   * 制御するときの値
   *
   * `undefined` 以外なら制御、`undefined` なら非制御として扱う。描画のたびに判定する。
   * `null` は「空の値」として制御に含める。
   */
  value?: T;

  /**
   * 非制御のときの初期値
   *
   * 最初の描画でだけ使い、後から変わっても反映しない。
   */
  defaultValue?: T;

  /**
   * 値を変えたときに呼ぶ関数
   *
   * 制御のときも呼ぶ。setter に渡した2つ目以降の引数を、そのまま受け取る。
   */
  onValueChange?: (value: T, ...rest: A) => void;
};

/**
 * `useControllableState` が返す、値を変える関数
 *
 * 2つ目以降の引数は、そのまま `onValueChange` に渡す。参照は常に同じ。
 */
export type ControllableStateSetter<T, A extends unknown[] = []> = (
  value: T,
  ...rest: A
) => void;
