import { Fragment } from 'react';
import { describe, expect, it } from 'vitest';
import transformContent from './transformContent';

describe('transformContent', () => {
  it('ReactElement・string・numberをcallbackで変換した配列を返す', () => {
    const result = transformContent(['a', 1, <div key="d" />], (node) =>
      typeof node === 'string' || typeof node === 'number' ? node : node.type,
    );

    expect(result).toEqual(['a', 1, 'div']);
  });

  it('Fragmentを透過して中身を処理する', () => {
    const result = transformContent(
      <>
        text
        <span key="s" />
      </>,
      (node) =>
        typeof node === 'string' || typeof node === 'number' ? node : node.type,
    );

    expect(result).toEqual(['text', 'span']);
  });

  it('複数のFragmentが並んでいても、indexが重複せず連番になる', () => {
    const result = transformContent(
      <>
        <Fragment key="f1">
          {'a'}
          {'b'}
        </Fragment>
        <Fragment key="f2">{'c'}</Fragment>
      </>,
      (_node, index) => index,
    );

    expect(result).toEqual([0, 1, 2]);
  });
});
