import { useSyncExternalStore } from 'react';

/**
 * 購読しない（値が変わることは無い）
 */
const subscribe = () => () => {};

const getSnapshot = () => true;

const getServerSnapshot = () => false;

/**
 * ハイドレーションが終わっているかを返すフック
 *
 * - サーバーの描画とハイドレーション中は false、その後は true を返す
 * - ハイドレーションの後にマウントしたコンポーネントや、クライアントだけで描画した場合は、最初から true を返す
 *
 * クライアントにしか無い値（`window`・`localStorage`・画面の幅など）を、ハイドレーションの不一致を起こさずに描画するために使う。
 * `typeof window` による判定と違い、クライアントでもハイドレーション中は false になる。
 * `useSyncExternalStore` の、サーバーとハイドレーション中は `getServerSnapshot` の値を使う性質を利用している。
 *
 * @returns ハイドレーションが終わっている場合は true
 */
export default function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
