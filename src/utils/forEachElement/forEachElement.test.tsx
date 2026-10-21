import { Fragment, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import forEachElement from './forEachElement';

describe('forEachElement', () => {
  it('Fragmentを透過し、ReactElementだけをindexの連番で処理する', () => {
    const calls: [unknown, number][] = [];
    forEachElement(
      <>
        text
        {1}
        {null}
        {false}
        <div key="a" />
        <Fragment key="f">
          <span key="b" />
        </Fragment>
      </>,
      (node, index) => calls.push([node.type, index]),
    );

    expect(calls).toEqual([
      ['div', 0],
      ['span', 1],
    ]);
  });

  it('ネストした配列やiterableも展開する', () => {
    const types: unknown[] = [];
    forEachElement(
      [[<div key="a" />], new Set<ReactElement>([<span key="b" />])],
      (node) => types.push(node.type),
    );

    expect(types).toEqual(['div', 'span']);
  });
});
