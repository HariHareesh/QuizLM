import { useState, useCallback, useRef, useEffect } from "react";
import { APIResponse } from "@repo/shared/types";

interface UseApiRequestState<T> {
  data: T | null;
  loading: boolean;
  message?: string | null;
}

export function useApiRequest<T>(
  asyncFunction: () => Promise<APIResponse<T>>,
  immediate: boolean = true
) {
  const [state, setState] = useState<UseApiRequestState<T>>({
    data: null,
    loading: immediate,
    message: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    setState({
      data: null,
      loading: true,
      message: null,
    });

    try {
      const response = await asyncFunction();

      if (response.success) {
        setState({
          data: response.data ?? null,
          loading: false,
          message: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          message:
            response.message ||
            "An unexpected error occurred",
        });
      }
    } catch (err) {
      setState({
        data: null,
        loading: false,
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred",
      });
    }
  }, [asyncFunction]);

  // ✅ RUN ONLY ONCE
  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}