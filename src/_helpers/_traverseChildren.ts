import type { FragmentProps, ReactElement, ReactNode } from 'react';
import { Children, Fragment, isValidElement } from 'react';

// Fragmentをまたいでも一意になるindexを払い出すカーソル
type IndexCursor = { current: number };

/**
 * ReactElement、string、numberのいずれかであるかを判定する
 * @param child 子要素
 */
export function _isContent(
  child: ReactNode,
): child is ReactElement | string | number {
  return (
    isValidElement(child) ||
    typeof child === 'string' ||
    typeof child === 'number'
  );
}

/**
 * React.Fragmentを透過し、children内の`accept`に一致する子要素を処理する
 *
 * 配列やiterableは`Children.forEach`が展開するため、ここではFragmentだけを展開する。
 *
 * @param children エレメントの子要素
 * @param accept 処理する子要素かどうかを判定する関数
 * @param callback コールバック
 * @param collect コールバックの結果を収集する処理
 * @param cursor Fragmentをまたいでindexを連番にする為のカーソル(内部再帰用)
 */
export default function _traverseChildren<N extends ReactNode, T>(
  children: ReactNode,
  accept: (child: ReactNode) => child is N,
  callback: (node: N, index: number) => T,
  collect: (value: T) => void = () => {},
  cursor: IndexCursor = { current: 0 },
): void {
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      _traverseChildren(
        (child.props as FragmentProps).children,
        accept,
        callback,
        collect,
        cursor,
      );
    } else if (accept(child)) {
      collect(callback(child, cursor.current++));
    }
  });
}
