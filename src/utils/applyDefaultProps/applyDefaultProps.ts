import type { AppliedProps } from './types';

/** props に存在しないキーを含む defaults を型エラーにする */
type NoExtraKeys<P, Ds extends readonly object[]> = {
  [I in keyof Ds]: Ds[I] & { [K in Exclude<keyof Ds[I], keyof P>]: never };
};

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
 * @param props    コンポーネントに渡された props
 * @param defaults props の一部のプロパティにデフォルト値を設定したオブジェクト（複数可、先の引数ほど優先）
 */
export default function applyDefaultProps<
  P extends object,
  const Ds extends readonly Partial<P>[],
>(props: P, ...defaults: Ds & NoExtraKeys<P, Ds>): AppliedProps<P, Ds> {
  const result = { ...props } as Record<PropertyKey, unknown>;

  // 単一の defaults 用のルールを、左の defaults から順に適用する
  for (const d of defaults as readonly Record<string, unknown>[]) {
    for (const key of Object.keys(d)) {
      const current = result[key];
      const defaultValue = d[key];
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
