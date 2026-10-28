import { act, renderHook } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import useIsHydrated from './useIsHydrated';

describe('useIsHydrated', () => {
  it('クライアントだけで描画した場合は、最初から true を返す', () => {
    const values: boolean[] = [];
    renderHook(() => {
      values.push(useIsHydrated());
    });

    expect(values).toEqual([true]);
  });

  it('サーバーの描画では false を返す', () => {
    function Component() {
      return <p>{String(useIsHydrated())}</p>;
    }

    expect(renderToString(<Component />)).toBe('<p>false</p>');
  });

  it('ハイドレーション中は false、その後は true を返し、不一致は起きない', async () => {
    const values: boolean[] = [];
    function Component() {
      const isHydrated = useIsHydrated();
      values.push(isHydrated);
      return <p>{String(isHydrated)}</p>;
    }
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Component />);
    const onRecoverableError = vi.fn();

    await act(async () => {
      hydrateRoot(container, <Component />, { onRecoverableError });
    });

    // ハイドレーション中の描画の回数は React に任せるため、最初と最後だけを確かめる
    expect(values[0]).toBe(false);
    expect(values[values.length - 1]).toBe(true);
    expect(container.innerHTML).toBe('<p>true</p>');
    expect(onRecoverableError).not.toHaveBeenCalled();
  });
});
