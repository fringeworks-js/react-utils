import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import ensureComponent from './ensureComponent';

describe('ensureComponent', () => {
  it('組み込みタグをコンポーネントに変換し、propsとrefを渡す', () => {
    const Div = ensureComponent('div');
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Div ref={ref} id="a">
        text
      </Div>,
    );

    const div = container.firstElementChild;
    expect(div?.tagName).toBe('DIV');
    expect(div?.id).toBe('a');
    expect(div?.textContent).toBe('text');
    expect(ref.current).toBe(div);
  });

  it('同じタグには同じコンポーネントを返す', () => {
    expect(ensureComponent('span')).toBe(ensureComponent('span'));
    expect(ensureComponent('span')).not.toBe(ensureComponent('p'));
  });

  it('displayNameにタグ名を含める', () => {
    expect(ensureComponent('section').displayName).toBe(
      'ensureComponent(section)',
    );
  });

  it('コンポーネントはそのまま返す', () => {
    const Comp = () => null;
    expect(ensureComponent(Comp)).toBe(Comp);
  });
});
