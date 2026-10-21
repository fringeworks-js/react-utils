import { useRef } from 'react';

/**
 * 配列数が常に一定であることを保証する為のフック\
 * 配列数が変わった際にはエラーをスローする
 * @param arr 配列
 * @throws Error
 */
export default function useStableLength(arr: readonly unknown[]): void {
  const lengthRef = useRef(arr.length);

  // レンダリングに影響する参照ではないため、lintのエラーは無視する
  // eslint-disable-next-line react-hooks/refs
  const length = lengthRef.current;
  if (length !== arr.length) {
    throw new Error(
      `useStableLength: Array length must remain stable across renders (${length} → ${arr.length})`,
    );
  }
}
