import { useCallback, useState } from 'react';
import markAt from '../../utils/markAt';
import type {
  ExecutionFunction,
  ExecutionRequest,
  UseExecutionAtResult,
} from './types';

/**
 * Execution Requestプロパティ(xxxxxAt)へ渡す値と、\
 * 処理実行用のトリガー関数を作るフック。\
 * 命令的コンポーネントをラップしたreactコンポーネントで、\
 * プロパティを通じて命令的コンポーネントのメソッドを実行する仕組みを提供する。
 *
 * @template P 実行時にExecution Requestプロパティに渡すペイロードの型
 * @returns [request, execute]
 * - `request`: 現在のリクエスト
 * - `execute`: 新しいリクエストを発行する関数
 * @example
 * // 1. Hookの宣言
 * const [undoAt, undo] = useExecutionAt<string>();
 * // 2. 実行のトリガーになるコンポーネント
 * <button onClick={() => undo('no-123')}>Undo</button>
 * // 3. 処理を実行するコンポーネント
 * <WrappedImperativeComponent undoAt={undoAt} />
 */
export default function useExecutionAt<P = void>(): UseExecutionAtResult<P> {
  // 実行時の状態を表す値
  const [executionRequest, setExecutionRequest] = useState<ExecutionRequest<P>>(
    {
      at: 0,
      payload: undefined,
    },
  );
  // 処理実行用関数
  const execute = useCallback<ExecutionFunction<P>>((payload?: P) => {
    setExecutionRequest({
      at: markAt(),
      payload,
    });
  }, []);

  return [executionRequest, execute];
}
