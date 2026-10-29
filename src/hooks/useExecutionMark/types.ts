import type { ExecutionMark } from '../../types';

/**
 * useExecutionMark の戻り値
 */
export type UseExecutionMarkResult = readonly [
  mark: ExecutionMark,
  execute: () => void,
];
