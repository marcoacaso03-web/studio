import { renderHook, act } from '@testing-library/react';
import { useAsyncAction } from './useAsyncAction';

describe('useAsyncAction', () => {
  it('sets loading and returns data on success', async () => {
    const action = jest.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useAsyncAction(action));

    let data: any;
    await act(async () => {
      data = await result.current.run('input');
    });

    expect(action).toHaveBeenCalledWith('input');
    expect(data).toEqual({ ok: true });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({ ok: true });
  });

  it('captures a uniform error string on failure (no raw throw)', async () => {
    const action = jest.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAsyncAction(action));

    let data: any;
    await act(async () => {
      data = await result.current.run('input');
    });

    expect(data).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('boom');
    expect(result.current.data).toBeNull();
  });

  it('handles non-Error rejections gracefully', async () => {
    const action = jest.fn().mockRejectedValue('string failure');
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.run('input');
    });

    expect(result.current.error).toBe('Si è verificato un errore imprevisto.');
  });

  it('reset clears state', async () => {
    const action = jest.fn().mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.run('input');
    });
    expect(result.current.error).toBe('x');

    act(() => result.current.reset());
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
