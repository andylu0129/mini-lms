'use client';

import { getConsultationList } from '@/app/(protected)/dashboard/actions';
import { ConsultationCard } from '@/components/consultation-card';
import { ConsultationCardSkeleton } from '@/components/consultation-card-skeleton';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/lib/shadcn/components/ui/button';
import { ConsultationRowWithStatus } from '@/types/global';
import { Plus, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export function StudentDashboard() {
  const router = useRouter();
  const user = { firstName: 'John', lastName: 'Doe' };

  const PAGE_SIZE = 5;

  const [consultationList, setConsultationList] = useState<ConsultationRowWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreItems, setHasMoreItems] = useState(false);
  const [shouldDisplayError, setShouldDisplayError] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  // Stable ref so the IntersectionObserver callback always calls the latest loadMore
  // without needing to re-create the observer on every render.
  const loadMoreRef = useRef<() => void>(() => {});

  const handleGetConsultationList = async () => {
    try {
      setIsLoading(true);
      setShouldDisplayError(false);

      const { success, data, hasMore } = await getConsultationList(0, PAGE_SIZE);

      setConsultationList(data);
      setHasMoreItems(hasMore);
      if (!success) {
        setShouldDisplayError(true);
      }
    } catch (error) {
      console.error('Error getting consultation list:', error);
      setShouldDisplayError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookConsultationClick = () => {
    router.push('/dashboard/consultation-booking');
  };

  const loadMore = useCallback(async () => {
    try {
      setIsLoadingMore(true);

      const offset = consultationList.length;
      const { success, data, hasMore } = await getConsultationList(offset, PAGE_SIZE);

      if (success) {
        setConsultationList((prev) => [...prev, ...data]);
        setHasMoreItems(hasMore);
      }
    } catch (error) {
      console.error('Error loading more consultations:', error);
      setShouldDisplayError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [consultationList.length]);

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
        if (entries[0].isIntersecting && hasMoreItems) {
          loadMoreRef.current();
        }
      });

      // If React gave us a real node (not null), start watching it.
      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoadingMore, hasMoreItems],
  );

  // Keep the ref in sync with the latest loadMore instance.
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    handleGetConsultationList();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Greeting and actions section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-foreground text-2xl font-bold text-balance sm:text-3xl">
              {user ? `Welcome, ${user.firstName}` : 'My Consultations'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage and track your consultation appointments</p>
          </div>
          <Button
            onClick={() => {
              handleBookConsultationClick();
            }}
            className="gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Book Consultation
          </Button>
        </div>

        {/* Consultation list */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ConsultationCardSkeleton key={i} />
            ))}
          </div>
        ) : shouldDisplayError ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-yellow-300 bg-yellow-50 py-16 text-center dark:border-yellow-700 dark:bg-yellow-950">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <TriangleAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Something went wrong
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              We couldn&apos;t load your consultations. Please try again.
            </p>
            <Button
              onClick={() => {
                handleGetConsultationList();
              }}
              className="mt-4 gap-2"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : consultationList.length === 0 ? (
          <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Search className="text-muted-foreground h-5 w-5" />
            </div>
            <h3 className="font-display text-foreground text-lg font-semibold">No consultations found</h3>
            <p className="text-muted-foreground mt-1 text-sm">Book your first consultation to get started.</p>

            <Button
              onClick={() => {
                handleBookConsultationClick();
              }}
              className="mt-4 gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Book Consultation
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {consultationList.map((consultation, index) => (
              <div key={consultation.id} ref={index === consultationList.length - 1 ? lastItemRef : undefined}>
                <ConsultationCard consultation={consultation} />
              </div>
            ))}
            {!!isLoadingMore &&
              Array.from({ length: PAGE_SIZE }).map((_, i) => <ConsultationCardSkeleton key={`loading-more-${i}`} />)}
          </div>
        )}
      </main>
    </div>
  );
}
