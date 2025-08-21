import { useState, useCallback, useEffect } from 'react';

interface PaginationState<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
}

interface UsePaginationOptions {
  limit?: number;
  initialPage?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Hook for managing paginated data fetching
 */
export function usePagination<T>(
  fetchFunction: (params: { page: number; limit: number }) => Promise<PaginatedResponse<T>>,
  options?: UsePaginationOptions
) {
  const limit = options?.limit || 20;
  const initialPage = options?.initialPage || 1;

  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    page: initialPage,
    totalPages: 0,
    total: 0,
    isLoading: false,
    error: null,
    hasMore: false,
  });

  /**
   * Load a specific page
   */
  const loadPage = useCallback(async (page: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetchFunction({ page, limit });
      
      setState(prev => ({
        ...prev,
        data: response.data,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
        hasMore: response.pagination.hasMore,
        isLoading: false,
      }));

      options?.onSuccess?.(response.data);
    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, error: err, isLoading: false }));
      options?.onError?.(err);
    }
  }, [fetchFunction, limit, options]);

  /**
   * Load next page
   */
  const nextPage = useCallback(() => {
    if (state.page < state.totalPages) {
      loadPage(state.page + 1);
    }
  }, [state.page, state.totalPages, loadPage]);

  /**
   * Load previous page
   */
  const previousPage = useCallback(() => {
    if (state.page > 1) {
      loadPage(state.page - 1);
    }
  }, [state.page, loadPage]);

  /**
   * Refresh current page
   */
  const refresh = useCallback(() => {
    loadPage(state.page);
  }, [state.page, loadPage]);

  /**
   * Reset to first page
   */
  const reset = useCallback(() => {
    loadPage(1);
  }, [loadPage]);

  // Load initial data
  useEffect(() => {
    loadPage(initialPage);
  }, []);

  return {
    ...state,
    loadPage,
    nextPage,
    previousPage,
    refresh,
    reset,
    canGoNext: state.page < state.totalPages,
    canGoPrevious: state.page > 1,
  };
}

/**
 * Hook for infinite scroll pagination
 */
export function useInfiniteScroll<T>(
  fetchFunction: (params: { page: number; limit: number }) => Promise<PaginatedResponse<T>>,
  options?: UsePaginationOptions
) {
  const limit = options?.limit || 20;

  const [state, setState] = useState<{
    data: T[];
    page: number;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: Error | null;
    hasMore: boolean;
  }>({
    data: [],
    page: 0,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: true,
  });

  /**
   * Load more data
   */
  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || !state.hasMore) return;

    const nextPage = state.page + 1;
    setState(prev => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const response = await fetchFunction({ page: nextPage, limit });
      
      setState(prev => ({
        ...prev,
        data: [...prev.data, ...response.data],
        page: nextPage,
        hasMore: response.pagination.hasMore,
        isLoadingMore: false,
      }));

      options?.onSuccess?.(response.data);
    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, error: err, isLoadingMore: false }));
      options?.onError?.(err);
    }
  }, [state.page, state.isLoadingMore, state.hasMore, fetchFunction, limit, options]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetchFunction({ page: 1, limit });
      
      setState({
        data: response.data,
        page: 1,
        hasMore: response.pagination.hasMore,
        isLoading: false,
        isLoadingMore: false,
        error: null,
      });

      options?.onSuccess?.(response.data);
    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, error: err, isLoading: false }));
      options?.onError?.(err);
    }
  }, [fetchFunction, limit, options]);

  // Load initial data
  useEffect(() => {
    refresh();
  }, []);

  return {
    ...state,
    loadMore,
    refresh,
  };
}

/**
 * Hook for cursor-based pagination (for real-time feeds)
 */
export function useCursorPagination<T>(
  fetchFunction: (params: { cursor?: string; limit: number }) => Promise<{
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
  }>,
  options?: Omit<UsePaginationOptions, 'initialPage'>
) {
  const limit = options?.limit || 20;

  const [state, setState] = useState<{
    data: T[];
    cursor?: string;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: Error | null;
    hasMore: boolean;
  }>({
    data: [],
    cursor: undefined,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: true,
  });

  /**
   * Load more data
   */
  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || !state.hasMore) return;

    setState(prev => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const response = await fetchFunction({ cursor: state.cursor, limit });
      
      setState(prev => ({
        ...prev,
        data: [...prev.data, ...response.data],
        cursor: response.nextCursor,
        hasMore: response.hasMore,
        isLoadingMore: false,
      }));

      options?.onSuccess?.(response.data);
    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, error: err, isLoadingMore: false }));
      options?.onError?.(err);
    }
  }, [state.cursor, state.isLoadingMore, state.hasMore, fetchFunction, limit, options]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetchFunction({ limit });
      
      setState({
        data: response.data,
        cursor: response.nextCursor,
        hasMore: response.hasMore,
        isLoading: false,
        isLoadingMore: false,
        error: null,
      });

      options?.onSuccess?.(response.data);
    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, error: err, isLoading: false }));
      options?.onError?.(err);
    }
  }, [fetchFunction, limit, options]);

  // Load initial data
  useEffect(() => {
    refresh();
  }, []);

  return {
    ...state,
    loadMore,
    refresh,
  };
}