import isIterable from '@fringeworks/utils/type/isIterable';
import type { FragmentProps, ReactNode } from 'react';
import { Children, Fragment, isValidElement } from 'react';

// Fragmentをまたいでも一意になるindexを払い出すカーソル
type IndexCursor = { current: number };

/**
 * React.Fragmentを透過し、children内のReactElementを処理する
 * @param children エレメントの子要素
 * @param callback コールバック
 * @param collect コールバックの結果を収集する処理
 * @param cursor Fragmentをまたいでindexを連番にする為のカーソル(内部再帰用)
 */
export default function _traverseElement<N, T>(
  children: ReactNode,
  callback: (node: N, index: number) => T,
  collect: (value: T) => void = () => {},
  cursor: IndexCursor = { current: 0 },
): void {
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Fragment) {
        _traverseElement(
          (child.props as FragmentProps).children,
          callback,
          collect,
          cursor,
        );
      } else {
        collect(callback(child as N, cursor.current++));
      }
    } else if (isIterable(child) && typeof child !== 'string') {
      _traverseElement(child, callback, collect, cursor);
    }
  });
}
