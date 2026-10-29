import type { ExecutionMark } from '../../types';

// 直近に払い出した値
let count = 0;

/**
 * 呼び出す度に単調増加する一意な値（実行の印）を返す
 * @returns 1 から始まり、呼ぶたびに増える値
 */
export default function markAt(): ExecutionMark {
  count += 1;
  return count;
}
