import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cloneElement } from 'react';

/**
 * classNameとstyleはマージ、それ以外のプロパティはpropsの値で上書きしてcloneElementを実行する
 * @param element エレメント
 * @param overrideProps 新しいエレメントのプロパティをオーバーライドするプロパティ
 * @param children 子要素
 * @returns
 */
export default function extendElement<
  P extends HTMLAttributes<T>,
  T extends HTMLElement,
>(
  element: ReactElement<P>,
  overrideProps?: P,
  ...children: ReactNode[]
): ReactElement<P> {
  const { className: elClassName, style: elStyle, ...elRest } = element.props;
  const {
    className: orClassName,
    style: orStyle,
    ...orRest
  } = overrideProps || {};

  // classNameのマージ
  let className = elClassName;
  if (orClassName != null) {
    className = className ? `${className} ${orClassName}` : orClassName;
  }

  // styleのマージ
  const style: Record<string, unknown> = { ...elStyle };
  if (orStyle) {
    for (const [key, value] of Object.entries(orStyle)) {
      if (value !== undefined) {
        style[key] = value;
      }
    }
  }

  // propsのマージ
  const props: Record<string, unknown> = { className, style, ...elRest };
  for (const [key, value] of Object.entries(orRest)) {
    if (value !== undefined) {
      props[key] = value;
    }
  }

  return cloneElement(element, props as P, ...children);
}
