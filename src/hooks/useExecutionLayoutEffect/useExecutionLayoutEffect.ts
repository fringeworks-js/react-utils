import { useLayoutEffect } from 'react';
import useExecutionHandler from '../../_internal/_useExecutionHandler';
import type { ExecutionMark } from '../../types';
import type { ExecutionRequest } from '../useExecutionAt';

/**
 * Execution Request プロパティ（xxxAt）を受け取り、要求があったときに画面に表示する前に処理を実行するフック
 *
 * `useExecutionEffect` の、処理を `useLayoutEffect` で実行する版。
 * スクロールの位置を合わせる、計測し直すなど、結果を画面に表示する前に反映したい処理に使う。
 * 要求の扱いは `useExecutionEffect` と同じ。
 *
 * @param request 受け取った Execution Request（`useExecutionAt` の値、または payload の無い ExecutionMark）。undefined の場合は要求なし
 * @param callback 要求があったときに実行する処理。要求の payload を受け取る
 */
export default function useExecutionLayoutEffect<P = void>(
  request: ExecutionRequest<P> | ExecutionMark | undefined,
  callback: (payload: P | undefined) => void,
): void {
  const handle = useExecutionHandler(request, callback);

  useLayoutEffect(() => {
    handle();
  }, [handle]);
}
