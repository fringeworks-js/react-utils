/**
 * payload の無い Execution Request（実行の印）
 *
 * 実体は数値。Execution Request プロパティ（xxxAt）に渡し、値が変わるたびに1回の要求とみなす。
 * **要求のたびに、前回と異なる値にすること**（同じ値を続けて渡しても、2回目は要求とみなさない）。
 * `markAt()` で作ると、呼ぶたびに異なる値になる。`useExecutionMark` を使うと、`markAt()` で作った値と、要求する関数を受け取れる。
 * `0` は「まだ要求していない」を表し、実行しない。
 */
export type ExecutionMark = number;

/**
 * useExecutionMark の戻り値
 */
export type UseExecutionMarkResult = readonly [
  mark: ExecutionMark,
  execute: () => void,
];
