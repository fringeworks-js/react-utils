import { describe, expect, expectTypeOf, it } from 'vitest';
import applyDefaultProps from './applyDefaultProps';

type Props = {
  size?: 'small' | 'large';
  color?: string | null;
  label: string;
};

describe('applyDefaultProps', () => {
  it('undefinedとnullのプロパティにデフォルト値を反映する', () => {
    const props: Props = { color: null, label: 'a' };
    const result = applyDefaultProps(props, { size: 'small', color: 'red' });

    expect(result).toEqual({ size: 'small', color: 'red', label: 'a' });
  });

  it('値があるプロパティは変更しない', () => {
    const props: Props = { size: 'large', color: '', label: 'a' };
    const result = applyDefaultProps(props, { size: 'small', color: 'red' });

    expect(result).toEqual({ size: 'large', color: '', label: 'a' });
  });

  it('元のpropsを変更せず、新しいオブジェクトを返す', () => {
    const props: Props = { label: 'a' };
    const result = applyDefaultProps(props, { size: 'small' });

    expect(result).not.toBe(props);
    expect(props).toEqual({ label: 'a' });
  });

  it('デフォルト値がundefinedのプロパティは反映しない', () => {
    const props: Props = { label: 'a' };
    const result = applyDefaultProps(props, { size: undefined });

    expect(result).toEqual({ label: 'a' });
    expect('size' in result).toBe(false);
  });

  it('複数のdefaultsは先の引数ほど優先される', () => {
    const props: Props = { label: 'a' };
    const result = applyDefaultProps(
      props,
      { size: 'large' },
      { size: 'small', color: 'red' },
    );

    expect(result).toEqual({ size: 'large', color: 'red', label: 'a' });
  });

  it('defaultsのnullは後続のdefaultsで埋められる', () => {
    const props: Props = { label: 'a' };
    const result = applyDefaultProps(props, { color: null }, { color: 'red' });

    expect(result.color).toBe('red');
  });

  it('null・undefined・falseのdefaultsはスキップする', () => {
    const props: Props = { label: 'a' };
    const isCompact = false as boolean;
    const result = applyDefaultProps(
      props,
      null,
      undefined,
      isCompact && { size: 'small' },
      { size: 'large' },
    );

    expect(result).toEqual({ size: 'large', label: 'a' });
  });

  it('symbolのキーは無視する', () => {
    const key = Symbol('key');
    const props = { [key]: undefined as string | undefined };
    const result = applyDefaultProps(props, { [key]: 'a' });

    expect(result[key]).toBeUndefined();
  });

  describe('型', () => {
    it('確実にデフォルト値があるキーはnull・undefinedが取り除かれる', () => {
      const props: Props = { label: 'a' };
      const result = applyDefaultProps(props, { size: 'small', color: 'red' });

      expectTypeOf(result.size).toEqualTypeOf<'small' | 'large'>();
      expectTypeOf(result.color).toEqualTypeOf<string>();
      expectTypeOf(result.label).toEqualTypeOf<string>();
    });

    it('スキップされうるdefaultsだけのキーはundefinedが残る', () => {
      const props: Props = { label: 'a' };
      const isCompact = false as boolean;
      const result = applyDefaultProps(props, isCompact && { size: 'small' });

      expectTypeOf(result.size).toEqualTypeOf<'small' | 'large' | undefined>();
    });

    it('propsに無いキーを含むdefaultsは型エラーになる', () => {
      const props: Props = { label: 'a' };
      // @ts-expect-error unknownはPropsに無い
      applyDefaultProps(props, { unknown: 1 });
    });
  });
});
