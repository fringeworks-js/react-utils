import { useEffect } from 'react';
import useExecutionHandler from '../../_internal/_useExecutionHandler';
import type { ExecutionRequest } from '../useExecutionAt';
import type { ExecutionMark } from '../useExecutionMark';

/**
 * Execution Request プロパティ（xxxAt）を受け取り、要求があったときに処理を実行するフック
 *
 * `useExecutionAt`・`useExecutionMark` と対になる、受け取る側のフック。
 * 命令的なコンポーネントをラップした React のコンポーネントで、プロパティを通じてメソッドを実行する。
 * 処理は画面に表示した後（`useEffect`）に実行する。表示する前に実行する場合は `useExecutionLayoutEffect` を使う。
 *
 * - 印（`at`、または ExecutionMark の値）が変わったときだけ実行する（`payload` は比べない）
 * - マウントしたときに渡されていた要求は実行しない（マウントしたときの印を基準にする）
 * - 印が `0`（まだ要求していない）や undefined の場合は実行しない
 * - ExecutionMark を受け取った場合、コールバックの payload は undefined
 * - 次のレンダリングまでに複数回要求した場合は、最後の要求だけを実行する
 * - コールバックは最新のものを呼ぶ。参照が変わっても実行しない
 *
 * @param request 受け取った Execution Request（`useExecutionAt` の値、または payload の無い ExecutionMark）。undefined の場合は要求なし
 * @param callback 要求があったときに実行する処理。要求の payload を受け取る
 * @example
 * // 呼び出す側
 * const [undoAt, undo] = useExecutionAt<string>();
 * <WrappedImperativeComponent undoAt={undoAt} />
 * // 受け取る側（WrappedImperativeComponent の中）
 * useExecutionEffect(props.undoAt, (payload) => {
 *   instance.undo(payload);
 * });
 */
export default function useExecutionEffect<P = void>(
  request: ExecutionRequest<P> | ExecutionMark | undefined,
  callback: (payload: P | undefined) => void,
): void {
  const handle = useExecutionHandler(request, callback);

  useEffect(() => {
    handle();
  }, [handle]);
}
