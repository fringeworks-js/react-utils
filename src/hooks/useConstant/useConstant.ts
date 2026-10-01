import { useState } from 'react';

/**
 * 初回のレンダリングで作成した値を、アンマウントされるまで返し続けるhook
 *
 * `useMemo`はパフォーマンス最適化のためのhookであり、キャッシュが破棄されないことは保証されていない。
 * 状態を持つインスタンスなど、同一であることが動作の前提となる値はこのhookで保持する。
 *
 * @param factory 値を作成する関数。初回のレンダリングでのみ呼ばれる
 * @returns 値
 */
export default function useConstant<T>(factory: () => T): T {
  // useStateの初期値はアンマウントされるまで保持されることが保証されている
  const [value] = useState(factory);
  return value;
}
