import { forwardRef, memo } from 'react';
import { describe, expect, it } from 'vitest';
import getComponentName from './getComponentName';

describe('getComponentName', () => {
  it('HTMLの要素名はそのまま返す', () => {
    expect(getComponentName('div')).toBe('div');
  });

  it('関数名を返す', () => {
    function Card() {
      return null;
    }
    expect(getComponentName(Card)).toBe('Card');
  });

  it('displayNameを関数名より優先する', () => {
    function Card() {
      return null;
    }
    Card.displayName = 'MyCard';
    expect(getComponentName(Card)).toBe('MyCard');
  });

  it('forwardRef・memoのコンポーネントはdisplayNameを返す', () => {
    const Named = forwardRef<HTMLDivElement>(() => null);
    Named.displayName = 'Named';
    const Memo = memo(() => null);
    Memo.displayName = 'Memo';
    expect(getComponentName(Named)).toBe('Named');
    expect(getComponentName(Memo)).toBe('Memo');
  });

  it('名前の無いコンポーネントはUnknownを返す', () => {
    expect(getComponentName(() => null)).toBe('Unknown');
    expect(getComponentName(forwardRef(() => null))).toBe('Unknown');
  });
});
