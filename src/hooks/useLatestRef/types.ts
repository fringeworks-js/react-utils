/**
 * 最新の値を保持する参照
 */
export type LatestRef<T> = {
  /**
   * 最後にコミットされたレンダリングでの値
   */
  readonly current: T;
};
