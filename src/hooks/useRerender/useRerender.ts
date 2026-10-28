import { useReducer } from 'react';

/**
 * 再レンダリングだけを起こす関数を返すフック
 *
 * 値を持たずに描画し直したい場合（外部の状態を読み直して表示するときなど）に使う。
 * `useReducer` のカウンターを進めることで、再レンダリングを要求する。
 *
 * @returns 呼ぶと再レンダリングを要求する関数。参照は常に同じ
 */
export default function useRerender(): () => void {
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  return rerender;
}
