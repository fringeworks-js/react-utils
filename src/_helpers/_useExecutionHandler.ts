import { useCallback, useRef } from 'react';
import useConstant from '../hooks/useConstant';
import type { ExecutionRequest } from '../hooks/useExecutionAt';
import useLatestRef from '../hooks/useLatestRef';
import markAt from '../utils/markAt';

/**
 * Execution Request を受け取り、要求があれば処理を実行する関数を返すフック
 *
 * `useExecutionEffect`・`useExecutionLayoutEffect` に共通の処理。返す関数をエフェクトで呼ぶ。
 *
 * - 初回のレンダリングで `markAt()` の値を基準にし、`at` がそれより大きい要求だけを実行する。
 *   `at` は `markAt()` で単調に増えるため、マウントより前に出た要求は実行しない
 * - 一度実行した要求は、エフェクトが再実行されても（StrictMode など）実行しない
 * - コールバックは最新のものを呼ぶ
 *
 * @param request 受け取った Execution Request。undefined の場合は要求なし
 * @param callback 要求があったときに実行する処理
 * @returns エフェクトで呼ぶ関数。参照は request が変わったときだけ変わる
 */
export default function useExecutionHandler<P>(
  request: ExecutionRequest<P> | undefined,
  callback: (payload: P | undefined) => void,
): () => void {
  const callbackRef = useLatestRef(callback);
  const baseline = useConstant(markAt);
  const handledAtRef = useRef(baseline);

  return useCallback(() => {
    if (request && request.at > handledAtRef.current) {
      handledAtRef.current = request.at;
      callbackRef.current(request.payload);
    }
  }, [request, callbackRef]);
}
