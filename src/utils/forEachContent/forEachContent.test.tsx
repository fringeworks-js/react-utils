import { Fragment } from 'react';
import { describe, expect, it } from 'vitest';
import forEachContent from './forEachContent';

describe('forEachContent', () => {
  it('Fragmentを透過し、ReactElement・string・numberをindexの連番で処理する', () => {
    const calls: [unknown, number][] = [];
    forEachContent(
      <>
        {'text'}
        {null}
        {false}
        {undefined}
        <Fragment key="f">
          {1}
          <div key="a" />
        </Fragment>
      </>,
      (node, index) =>
        calls.push([typeof node === 'object' ? node.type : node, index]),
    );

    expect(calls).toEqual([
      ['text', 0],
      [1, 1],
      ['div', 2],
    ]);
  });

  it('ネストした配列の中の文字列を1文字ずつに分割しない', () => {
    const nodes: unknown[] = [];
    forEachContent([['ab', ['cd']]], (node) => nodes.push(node));

    expect(nodes).toEqual(['ab', 'cd']);
  });
});
