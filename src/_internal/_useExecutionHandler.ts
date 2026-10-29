import { useCallback, useRef } from 'react';
import type { ExecutionRequest } from '../hooks/useExecutionAt';
import useLatestRef from '../hooks/useLatestRef';
import type { ExecutionMark } from '../types';

/**
 * 受け取った要求の印（`at`、または ExecutionMark の値）を返す
 */
const getMark = <P>(
  request: ExecutionRequest<P> | ExecutionMark | undefined,
): ExecutionMark | undefined =>
  typeof request === 'number' ? request : request?.at;

/**
 * Execution Request を受け取り、要求があれば処理を実行する関数を返すフック
 *
 * `useExecutionEffect`・`useExecutionLayoutEffect` に共通の処理。返す関数をエフェクトで呼ぶ。
 *
 * - 初回のレンダリングで受け取った印（`at`、または ExecutionMark の値）を基準にし、印が変わったときだけ実行する。
 *   マウントしたときに渡されていた要求は実行しない。印は `markAt()` で作ったものでなくてよい（カウンターなども使える）
 * - 印が `0`（まだ要求していない）や undefined（要求なし）の場合は実行しない
 * - 一度実行した要求は、エフェクトが再実行されても（StrictMode など）実行しない
 * - コールバックは最新のものを呼ぶ
 *
 * @param request 受け取った Execution Request。undefined の場合は要求なし
 * @param callback 要求があったときに実行する処理
 * @returns エフェクトで呼ぶ関数。参照は request が変わったときだけ変わる
 */
export default function useExecutionHandler<P>(
  request: ExecutionRequest<P> | ExecutionMark | undefined,
  callback: (payload: P | undefined) => void,
): () => void {
  const callbackRef = useLatestRef(callback);
  const handledRef = useRef(getMark(request));

  return useCallback(() => {
    const mark = getMark(request);
    if (
      mark === undefined ||
      mark === 0 ||
      Object.is(mark, handledRef.current)
    ) {
      return;
    }
    handledRef.current = mark;
    callbackRef.current(
      typeof request === 'number' ? undefined : request?.payload,
    );
  }, [request, callbackRef]);
}
