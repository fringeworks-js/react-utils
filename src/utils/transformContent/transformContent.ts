import type { ReactElement, ReactNode } from 'react';
import _traverseChildren, {
  _isContent,
} from '../../_internal/_traverseChildren';

/**
 * React.Fragmentを透過し、children内のReactElement、string、numberをcallbackで処理した戻り値を返す
 *
 * `Children.map`と異なり、keyの付け直しは行わない。
 * 別々のFragmentの中に同じkeyがあると、戻り値の配列の中でkeyが重複する。
 * 戻り値をそのまま描画する場合は、callbackの中でkeyを付けること。
 *
 * @param children エレメントの子要素
 * @param callback コールバック。indexはFragmentをまたいだ連番
 * @returns callbackの戻り値の配列
 */
export default function transformContent<T>(
  children: ReactNode,
  callback: (node: ReactElement | string | number, index: number) => T,
): T[] {
  const result: T[] = [];
  _traverseChildren(children, _isContent, callback, (value) =>
    result.push(value),
  );
  return result;
}
