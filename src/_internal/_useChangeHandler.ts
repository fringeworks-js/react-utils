import { useCallback, useRef } from 'react';
import type { ChangeDependencies } from '../hooks/useChangeEffect/types';
import useLatestRef from '../hooks/useLatestRef';

/**
 * 依存の値が変わったか（1段目のプロパティを `Object.is` で比べる）
 *
 * undefined はプロパティの無いオブジェクトとして扱う
 */
const isChanged = (
  prev: ChangeDependencies | undefined,
  next: ChangeDependencies | undefined,
): boolean => {
  if (prev === next) {
    return false;
  }
  const a = (prev ?? {}) as Record<string, unknown>;
  const b = (next ?? {}) as Record<string, unknown>;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return true;
  }
  return keys.some(
    (key) =>
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !Object.is(a[key], b[key]),
  );
};

/**
 * 依存の値（Change Dependencies）を受け取り、変わっていれば処理を実行する関数を返すフック
 *
 * `useChangeEffect`・`useChangeLayoutEffect` に共通の処理。返す関数を、毎回のコミットでエフェクトから呼ぶ。
 *
 * - 前回の処理の後にコミットした依存の値と比べる。初回のコミットの値が最初の基準になるため、初回は実行しない
 * - 比べるのはエフェクトの中（コミットした値どうし）。破棄されたレンダリングの値とは比べない
 * - 同じ値のままエフェクトが再実行されても（StrictMode など）実行しない
 * - コールバックは最新のものを呼ぶ
 *
 * @param dependencies 依存の値。undefined の場合は依存なし
 * @param callback 依存の値が変わったときに実行する処理
 * @returns エフェクトで呼ぶ関数。参照は常に同じ
 */
export default function useChangeHandler(
  dependencies: ChangeDependencies | undefined,
  callback: () => void,
): () => void {
  const dependenciesRef = useLatestRef(dependencies);
  const callbackRef = useLatestRef(callback);
  const committedRef = useRef(dependencies);

  return useCallback(() => {
    const next = dependenciesRef.current;
    if (isChanged(committedRef.current, next)) {
      committedRef.current = next;
      callbackRef.current();
    }
  }, [dependenciesRef, callbackRef]);
}
