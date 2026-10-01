import { useInsertionEffect, useRef } from 'react';
import type { LatestRef } from './types';

/**
 * 最新の値を保持する参照を返すhook
 *
 * 返却する参照は常に同じオブジェクトのため、依存配列に含めずに
 * イベントハンドラーやエフェクトの中から最新の値を参照できる。
 * 値はコミット時に更新されるため、レンダリング中には参照しないこと。
 *
 * @param value 値
 * @returns 最新の値を保持する参照
 */
export default function useLatestRef<T>(value: T): LatestRef<T> {
  const ref = useRef(value);

  // レンダリング中に更新すると、破棄されたレンダリングの値が残る可能性があるためコミット時に更新する
  // useInsertionEffectは他のエフェクトより先に実行されるため、
  // useLayoutEffect・useEffectの中から参照した場合も最新の値になる
  useInsertionEffect(() => {
    ref.current = value;
  });

  return ref;
}
