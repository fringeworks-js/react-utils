import type { ReactElement, ReactNode } from 'react';
import { cloneElement } from 'react';
import type { ExtendableProps } from './types';

/**
 * classNameとstyleはマージ、それ以外のプロパティはoverridePropsの値で上書きしてcloneElementを実行する
 *
 * - className: 元のclassNameの後ろに空白区切りで追加する（空文字は無視する）
 * - style: 元のstyleにプロパティ単位で上書きする（値がundefinedのプロパティは無視する）
 * - それ以外: overridePropsの値で上書きする（値がundefinedのプロパティは無視する）
 *
 * @param element エレメント
 * @param overrideProps 新しいエレメントのプロパティをオーバーライドするプロパティ
 * @param children 子要素。省略した場合は元の子要素を引き継ぐ
 * @returns 新しいエレメント
 */
export default function extendElement<P extends ExtendableProps>(
  element: ReactElement<P>,
  overrideProps?: Partial<P>,
  ...children: ReactNode[]
): ReactElement<P> {
  const { className, style, ...rest } = overrideProps ?? {};
  // cloneElementは元のpropsを引き継ぐため、変更するプロパティだけを渡す
  const props: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      props[key] = value;
    }
  }

  // classNameのマージ
  if (className) {
    const baseClassName = element.props.className;
    props.className = baseClassName
      ? `${baseClassName} ${className}`
      : className;
  }

  // styleのマージ
  if (style) {
    const mergedStyle: Record<string, unknown> = { ...element.props.style };
    for (const [key, value] of Object.entries(style)) {
      if (value !== undefined) {
        mergedStyle[key] = value;
      }
    }
    props.style = mergedStyle;
  }

  return cloneElement(element, props as Partial<P>, ...children);
}
