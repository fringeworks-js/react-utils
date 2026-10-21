import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import setRefCurrent from './setRefCurrent';

describe('setRefCurrent', () => {
  it('object refとcallback refに値を設定し、null・undefinedは無視する', () => {
    const objectRef = createRef<string>();
    const callbackRef = vi.fn();

    setRefCurrent('value', objectRef, null, callbackRef, undefined);

    expect(objectRef.current).toBe('value');
    expect(callbackRef).toHaveBeenCalledWith('value');
  });

  it('クリーンアップ関数でobject refにnullを設定する', () => {
    const objectRef = createRef<string>();

    const cleanup = setRefCurrent('value', objectRef);
    cleanup();

    expect(objectRef.current).toBeNull();
  });

  it('callback refがクリーンアップ関数を返した場合はそれを呼び、返さない場合はnullを渡す', () => {
    const innerCleanup = vi.fn();
    const withCleanup = vi.fn().mockReturnValue(innerCleanup);
    const withoutCleanup = vi.fn();

    const cleanup = setRefCurrent('value', withCleanup, withoutCleanup);
    withCleanup.mockClear();
    withoutCleanup.mockClear();
    cleanup();

    expect(innerCleanup).toHaveBeenCalledTimes(1);
    expect(withCleanup).not.toHaveBeenCalled();
    expect(withoutCleanup).toHaveBeenCalledWith(null);
  });
});
