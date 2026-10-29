import { useCallback, useState } from 'react';
import markAt from '../../utils/markAt';
import type { ExecutionMark, UseExecutionMarkResult } from './types';

/**
 * payload の無い Execution Request（実行の印）と、要求する関数を返すフック
 *
 * `useExecutionAt` の payload を持たない版。命令的なコンポーネントの `focus()`・`reset()` のような、
 * 引数の要らないメソッドを、プロパティを通じて実行する場合に使う。
 *
 * - 印は初期状態では `0`（まだ要求していない）で、`execute` を呼ぶたびに `markAt()` で作った新しい値になる
 * - `execute` の参照は常に同じ
 *
 * @returns [mark, execute]
 * @example
 * const [focusAt, focus] = useExecutionMark();
 * <button onClick={focus}>Focus</button>
 * <WrappedImperativeComponent focusAt={focusAt} />
 */
export default function useExecutionMark(): UseExecutionMarkResult {
  const [mark, setMark] = useState<ExecutionMark>(0);
  const execute = useCallback(() => {
    setMark(markAt());
  }, []);

  return [mark, execute];
}
