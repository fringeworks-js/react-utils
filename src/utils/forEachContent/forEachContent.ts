import type { ReactElement, ReactNode } from 'react';
import _traverseChildren, {
  _isContent,
} from '../../_internal/_traverseChildren';

/**
 * React.Fragmentを透過し、children内のReactElement、string、numberを処理する
 * @param children エレメントの子要素
 * @param callback コールバック。indexはFragmentをまたいだ連番
 */
export default function forEachContent(
  children: ReactNode,
  callback: (node: ReactElement | string | number, index: number) => void,
): void {
  _traverseChildren(children, _isContent, callback);
}
