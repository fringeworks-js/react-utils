import { useLayoutEffect } from 'react';
import useChangeHandler from '../../_internal/_useChangeHandler';
import type { ChangeDependencies } from '../useChangeEffect';

/**
 * 変化を見る依存の値（Change Dependencies）を受け取り、値が変わったときに画面に表示する前に処理を実行するフック
 *
 * `useChangeEffect` の、処理を `useLayoutEffect` で実行する版。
 * 測り直しなど、結果を画面に表示する前に反映したい処理に使う。
 * 依存の値の扱いは `useChangeEffect` と同じ。
 *
 * @param dependencies 受け取った依存の値。undefined の場合は依存なし
 * @param callback 依存の値が変わったときに実行する処理
 */
export default function useChangeLayoutEffect(
  dependencies: ChangeDependencies | undefined,
  callback: () => void,
): void {
  const handle = useChangeHandler(dependencies, callback);

  useLayoutEffect(() => {
    handle();
  });
}
