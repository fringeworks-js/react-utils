import type { ReactElement, ReactNode } from 'react';
import { isValidElement } from 'react';
import _traverseChildren from '../../_helpers/_traverseChildren';

/**
 * React.Fragmentを透過し、children内のReactElementを処理する
 * @param children エレメントの子要素
 * @param callback コールバック。indexはFragmentをまたいだ連番
 */
export default function forEachElement(
  children: ReactNode,
  callback: (node: ReactElement, index: number) => void,
): void {
  _traverseChildren(children, isValidElement, callback);
}
