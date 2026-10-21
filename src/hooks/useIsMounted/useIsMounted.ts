import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * マウントされているかどうかを判定する関数を返すフック
 *
 * DOMへのコミット時（`useLayoutEffect`）にtrueになり、アンマウント時にfalseになる。
 * レンダリング中に呼んだ場合は、初回のマウントが完了するまでfalseを返す。
 *
 * @returns マウントされている場合にtrueを返す関数。参照は常に同じ
 */
export default function useIsMounted(): () => boolean {
  const isMountedRef = useRef(false);
  const isMounted = useCallback(() => isMountedRef.current, []);

  useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMounted;
}
