import {
  createRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { describe, expect, it } from 'vitest';
import extendElement from './extendElement';

type ItemProps = {
  label: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const Item = (props: ItemProps) => <div {...props} />;

describe('extendElement', () => {
  it('classNameは空白区切りで追加する', () => {
    const element = extendElement(<div className="a" />, { className: 'b' });
    expect(element.props).toEqual({ className: 'a b' });
  });

  it('元のclassNameが無い場合はそのまま使い、空文字は無視する', () => {
    expect(extendElement(<div />, { className: 'b' }).props).toEqual({
      className: 'b',
    });
    expect(
      extendElement(<div className="a" />, { className: '' }).props,
    ).toEqual({ className: 'a' });
  });

  it('styleはプロパティ単位で上書きし、undefinedは無視する', () => {
    const element = extendElement(<div style={{ color: 'red', margin: 1 }} />, {
      style: { color: 'blue', margin: undefined, padding: 2 },
    });
    expect(element.props).toEqual({
      style: { color: 'blue', margin: 1, padding: 2 },
    });
  });

  it('classNameやstyleが無い場合はプロパティを追加しない', () => {
    const element = extendElement(<div id="a" />, { title: 't' });
    expect(element.props).toEqual({ id: 'a', title: 't' });
  });

  it('それ以外のプロパティは上書きし、undefinedは無視する', () => {
    const element = extendElement(<div id="a" title="t" />, {
      id: 'b',
      title: undefined,
    });
    expect(element.props).toEqual({ id: 'b', title: 't' });
  });

  it('childrenを省略した場合は元の子要素を引き継ぎ、指定した場合は置き換える', () => {
    expect(extendElement(<div>a</div>).props).toEqual({ children: 'a' });
    expect(extendElement(<div>a</div>, {}, 'b').props).toEqual({
      children: 'b',
    });
  });

  it('keyとrefを引き継ぐ', () => {
    const ref = createRef<HTMLDivElement>();
    const element = extendElement(<div key="k" ref={ref} />, {
      className: 'a',
    });
    expect(element.key).toBe('k');
    expect((element.props as { ref?: unknown }).ref).toBe(ref);
  });

  it('必須のpropsを持つエレメントにも一部のpropsだけを渡せる', () => {
    const base: ReactElement<ItemProps> = <Item label="a" className="x" />;
    const element = extendElement(base, { className: 'y' });
    expect(element.props).toEqual({ label: 'a', className: 'x y' });
  });
});
