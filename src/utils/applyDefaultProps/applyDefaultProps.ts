import type { AppliedProps, SkippedDefaults } from './types';

/** props に存在しないキーを含む defaults を型エラーにする */
type NoExtraKeys<P, Ds extends readonly unknown[]> = {
  [I in keyof Ds]: CheckKeys<P, Ds[I]>;
};

/** 要素がオブジェクトの場合のみキーを検査する（ユニオンの各要素ごとに分配） */
type CheckKeys<P, T> = T extends SkippedDefaults
  ? T
  : T & { [K in Exclude<keyof T, keyof P>]: never };

/**
 * props のプロパティが undefined または null で、
 * かつデフォルト値が undefined 以外の場合に、デフォルト値を反映した新しいオブジェクトを返す。
 * 元の props は変更しない。
 *
 * defaults は複数渡せる。その場合は上記のルールを左の defaults から順に適用するため、
 * 先の引数ほど優先される。つまり次の2つは同じ結果になる。
 *
 *   applyDefaultProps(props, d1, d2)
 *   applyDefaultProps(applyDefaultProps(props, d1), d2)
 *
 * キーごとに見ると `props[key] ?? d1[key] ?? d2[key] ?? ...` と同様に振る舞う。
 * defaults の null は反映されても反映先が null のままなので、後続の defaults に
 * null / undefined 以外の値があればそちらで埋められる。
 *
 * defaults の要素として null / undefined / false を渡した場合は、その要素はスキップされる
 * （渡さなかったのと同じ扱いになる）。条件付きのデフォルト値を次のように書ける。
 *
 *   applyDefaultProps(props, isCompact && compactDefaults, baseDefaults)
 *
 * @param props    コンポーネントに渡された props
 * @param defaults props の一部のプロパティにデフォルト値を設定したオブジェクト
 *                 （複数可、先の引数ほど優先。null / undefined / false はスキップ）
 */
export default function applyDefaultProps<
  P extends object,
  const Ds extends readonly (Partial<P> | SkippedDefaults)[],
>(props: P, ...defaults: Ds & NoExtraKeys<P, Ds>): AppliedProps<P, Ds> {
  const result = { ...props } as Record<PropertyKey, unknown>;

  // 単一の defaults 用のルールを、左の defaults から順に適用する
  for (const values of defaults as readonly (
    | Record<string, unknown>
    | SkippedDefaults
  )[]) {
    if (!values) {
      continue;
    }

    for (const key of Object.keys(values)) {
      const current = result[key];
      const defaultValue = values[key];
      if (
        (current === undefined || current === null) &&
        defaultValue !== undefined
      ) {
        result[key] = defaultValue;
      }
    }
  }

  return result as AppliedProps<P, Ds>;
}
