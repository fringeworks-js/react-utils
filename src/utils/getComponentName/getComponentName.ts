import type { ElementType } from 'react';

/**
 * コンポーネントの名前を取得する（HOCのdisplayNameなどに使う）
 *
 * - HTMLの要素名はそのまま使う
 * - displayName・関数名が無い（空文字の）場合は`Unknown`
 * @param Component コンポーネント
 * @returns
 */
export default function getComponentName(Component: ElementType): string {
  if (typeof Component === 'string') {
    return Component;
  }
  const { displayName, name } = Component as {
    displayName?: string;
    name?: string;
  };
  return displayName || name || 'Unknown';
}
