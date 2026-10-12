import type { Ref, RefCallback } from 'react';
import { useCallback } from 'react';
import setRefCurrent from '../../utils/setRefCurrent';
import useStableLength from '../useStableLength';

/**
 * 複数のrefに纏めて値を渡すことができるRefCallbackを取得する
 * @param refs
 * @returns
 */
export default function useCombinedRefs<T = unknown>(
  ...refs: Ref<T>[]
): RefCallback<T> {
  // 配列数に変更がないことを保証する
  useStableLength(refs);
  // 複数のrefに値を渡すためのsetterを作る
  const setter = useCallback<RefCallback<T>>((value: T) => {
    return setRefCurrent(value, ...refs);
    // 配列の要素数が変わらないことが保証されているのでlintのエラーは無視する
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  }, refs);

  return setter;
}
