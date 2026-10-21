import type { CSSProperties } from 'react';

/**
 * extendElementで拡張できるエレメントのprops
 */
export type ExtendableProps = {
  /**
   * マージするclassName
   */
  className?: string;

  /**
   * マージするstyle
   */
  style?: CSSProperties;
};
