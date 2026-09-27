/**
 * 交差型を1つのオブジェクト型に展開して、エディタ上の型表示を見やすくする
 */
type Simplify<T> = { [K in keyof T]: T[K] } & {};

/** defaults 群のいずれかに含まれるキーの和集合 */
type KeysOf<Ds extends readonly object[]> = Ds[number] extends infer U
  ? U extends unknown
    ? keyof U
    : never
  : never;

/** キー K について、undefined にならない値を確実に持つ defaults があるか */
type IsDefinitelyDefined<
  Ds extends readonly object[],
  K,
> = Ds extends readonly [infer Head, ...infer Rest extends readonly object[]]
  ? K extends keyof Head
    ? undefined extends Head[K]
      ? IsDefinitelyDefined<Rest, K>
      : true
    : IsDefinitelyDefined<Rest, K>
  : false;

/** キー K について、defaults 群から採用され得る値の型（undefined を除く） */
type DefaultValueOf<
  Ds extends readonly object[],
  K,
> = Ds[number] extends infer U
  ? U extends unknown
    ? K extends keyof U
      ? Exclude<U[K], undefined>
      : never
    : never
  : never;

/**
 * マージ後の props の型
 * - どの defaults にも含まれないキー: props の型をそのまま維持
 * - いずれかの defaults が確実に値を持つキー: null / undefined が取り除かれ、デフォルト値の型が加わる
 * - defaults の値が undefined になり得るキー: props の型にデフォルト値の型が加わる
 */
export type AppliedProps<P, Ds extends readonly object[]> = Simplify<
  Omit<P, KeysOf<Ds>> & {
    [K in KeysOf<Ds> & keyof P]: IsDefinitelyDefined<Ds, K> extends true
      ? NonNullable<P[K]> | DefaultValueOf<Ds, K>
      : P[K] | DefaultValueOf<Ds, K>;
  }
>;
