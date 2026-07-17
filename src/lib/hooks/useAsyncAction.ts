'use client';

import { useCallback, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface UseAsyncActionResult<TArgs, TResult> extends AsyncState<TResult> {
  run: (args: TArgs) => Promise<TResult | undefined>;
  reset: () => void;
}

/**
 * Centralised async-call state for AI / Firestore calls.
 *
 * Replaces the ad-hoc `isLoading` / `isAnalyzing` / `console.error` pattern
 * that was duplicated across every AI dialog. Now every async action shares
 * one shape: { data, error, loading, run, reset }.
 *
 * Usage:
 *   const { run, loading, error, reset } = useAsyncAction(callChatbot);
 *   const res = await run(input);
 *   if (error) { ... } // uniform error string, ready to show in a toast/inline
 */
export function useAsyncAction<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>,
  options?: { onError?: (e: unknown) => void },
): UseAsyncActionResult<TArgs, TResult> {
  const [state, setState] = useState<AsyncState<TResult>>({
    data: null,
    error: null,
    loading: false,
  });

  const run = useCallback(
    async (args: TArgs): Promise<TResult | undefined> => {
      setState({ data: null, error: null, loading: true });
      try {
        const data = await action(args);
        setState({ data, error: null, loading: false });
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Si è verificato un errore imprevisto.';
        setState({ data: null, error: message, loading: false });
        options?.onError?.(err);
        return undefined;
      }
    },
    [action, options],
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, run, reset };
}
