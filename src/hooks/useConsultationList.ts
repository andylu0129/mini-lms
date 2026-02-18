import { getConsultationList, getConsultationStats } from '@/app/(protected)/dashboard/actions';
import { DASHBOARD } from '@/constants/dashboard';
import { ConsultationRowWithStatus, ConsultationStatsData } from '@/types/global';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useConsultations(debouncedSearch: string, statusFilter: string) {
  const [list, setList] = useState<ConsultationRowWithStatus[]>([]);
  const [stats, setStats] = useState<ConsultationStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<() => void>(() => {});

  const fetchList = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const { success, data, hasMore } = await getConsultationList({
        offset: 0,
        limit: DASHBOARD.PAGINATION_SIZE,
        search: debouncedSearch,
        filter: statusFilter,
      });

      setList(data);
      setHasMore(hasMore);
      if (!success) {
        setIsError(true);
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  const fetchStats = async () => {
    try {
      const { success, data } = await getConsultationStats();

      if (success) {
        setStats(data[0] || null);
      }
    } catch {
      console.error('Error getting consultation stats');
    }
  };

  const loadMore = useCallback(async () => {
    try {
      setIsLoadingMore(true);

      const offset = list.length;
      const { success, data, hasMore } = await getConsultationList({
        offset,
        limit: DASHBOARD.PAGINATION_SIZE,
        search: debouncedSearch,
        filter: statusFilter,
      });

      if (success) {
        setList((prev) => [...prev, ...data]);
      }
      setHasMore(hasMore);
    } catch {
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [list.length, debouncedSearch, statusFilter]);

  // Keep the ref in sync with the latest loadMore instance
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  // Callback ref attached to the last consultation card.
  // When that element scrolls into view, it triggers the next page fetch.
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Don't set up a new observer while we're mid-fetch.
      if (isLoadingMore) {
        return;
      }

      // Tear down the old observer (was watching the previous last item).
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Create a fresh observer.
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreRef.current();
        }
      });

      // If React gave us a real node (not null), start watching it.
      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoadingMore, hasMore],
  );

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    list: list,
    stats: stats,
    isLoading: isLoading,
    isLoadingMore: isLoadingMore,
    hasMore: hasMore,
    isError: isError,
    fetchList: fetchList,
    lastItemRef: lastItemRef,
    setList: setList,
    setStats: setStats,
  };
}
