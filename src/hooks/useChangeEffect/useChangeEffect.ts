import { useEffect } from 'react';
import useChangeHandler from '../../_internal/_useChangeHandler';
import type { ChangeDependencies } from './types';

/**
 * 変化を見る依存の値（Change Dependencies）を受け取り、値が変わったときに処理を実行するフック
 *
 * `xxxOn` のプロパティ（例: `refreshOn`）を受け取る側のフック。
 * 結果が入力だけで決まる操作（測り直し、再計算など）を、利用者が渡した値の変化に合わせて実行する。
 * 回数や payload に意味がある命令は、Execution Request（`useExecutionAt`・`useExecutionEffect`）を使う。
 * 処理は画面に表示した後（`useEffect`）に実行する。表示する前に実行する場合は `useChangeLayoutEffect` を使う。
 *
 * - 1段目のプロパティを `Object.is` で比べ、どれかが変わったときに実行する。プロパティが増えた・減った場合も変化とみなす
 * - 初回（マウントしたとき）は実行しない
 * - undefined は依存なし（プロパティの無いオブジェクト）として扱う
 * - コールバックは最新のものを呼ぶ。参照が変わっても実行しない
 *
 * @param dependencies 受け取った依存の値。undefined の場合は依存なし
 * @param callback 依存の値が変わったときに実行する処理
 * @example
 * // 渡す側
 * <WrappedComponent refreshOn={{ className, theme }} />
 * // 受け取る側（WrappedComponent の中）
 * useChangeEffect(props.refreshOn, () => {
 *   instance.refresh();
 * });
 */
export default function useChangeEffect(
  dependencies: ChangeDependencies | undefined,
  callback: () => void,
): void {
  const handle = useChangeHandler(dependencies, callback);

  useEffect(() => {
    handle();
  });
}
