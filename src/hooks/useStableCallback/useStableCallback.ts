import { useCallback } from 'react';
import useLatestRef from '../useLatestRef';

/**
 * 参照が変わらず、呼ぶと最新のコールバックを実行する関数を返すフック
 *
 * 子のコンポーネントに渡すイベントハンドラーの参照を変えずに、中身は常に最新にする場合に使う。
 * React 19.2 の `useEffectEvent` と違い、子のコンポーネントに渡せる。
 *
 * 最新のコールバックはコミット時に反映されるため、レンダリング中には呼ばないこと（古いコールバックが呼ばれる）。
 * イベントハンドラーやエフェクトの中から呼ぶ。
 *
 * @param callback コールバック
 * @returns 最新のコールバックを呼ぶ関数。参照は常に同じ
 */
export default function useStableCallback<A extends unknown[], R>(
  callback: (...args: A) => R,
): (...args: A) => R {
  const latestRef = useLatestRef(callback);
  return useCallback((...args: A) => latestRef.current(...args), [latestRef]);
}
