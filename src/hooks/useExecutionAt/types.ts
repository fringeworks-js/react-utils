import type { MarkAtResult } from '../../utils/markAt';

/**
 * オプション
 */
export type UseExecutionAtOptions<P = void> = {
  /**
   * ペイロードの初期値
   */
  initialPayload?: P;
};

/**
 * 戻り値
 */
export type UseExecutionAtResult<P = void> = readonly [
  ExecutionRequest<P>,
  ExecutionFunction<P>,
];

/**
 * 実行時の状態を表す値
 */
export type ExecutionRequest<P = void> = {
  /**
   * 実行される度に増加する値
   */
  readonly at: MarkAtResult;

  /**
   * ペイロード
   * 初期値や実行時の引数を省略した場合は undefined
   */
  readonly payload: P | undefined;
};

/**
 * 処理実行用関数
 */
export type ExecutionFunction<P = void> = (payload?: P) => void;
