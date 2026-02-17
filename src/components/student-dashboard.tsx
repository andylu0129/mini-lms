'use client';

import { getConsultationList, markConsultation } from '@/app/(protected)/dashboard/actions';
import { ConsultationCard } from '@/components/consultation-card';
import { ConsultationCardSkeleton } from '@/components/consultation-card-skeleton';
import { ERROR_SOMETHING_WENT_WRONG, TEXT_BOOK_CONSULTATION, TEXT_CANCEL } from '@/constants/common';
import {
  TEXT_CONFIRM,
  TEXT_MARK_COMPLETE_DESCRIPTION,
  TEXT_MARK_COMPLETE_TITLE,
  TEXT_MARK_INCOMPLETE_DESCRIPTION,
  TEXT_MARK_INCOMPLETE_TITLE,
} from '@/constants/consultation-card';
import {
  ERROR_DESCRIPTION,
  ERROR_TITLE,
  PAGINATION_SIZE,
  SEARCH_DEBOUNCE_MS,
  TEXT_DASHBOARD_SUBTITLE,
  TEXT_MY_CONSULTATIONS,
  TEXT_NO_CONSULTATIONS_DESCRIPTION,
  TEXT_NO_CONSULTATIONS_TITLE,
  TEXT_RETRY,
  TEXT_SEARCH_ARIA_LABEL,
  TEXT_SEARCH_PLACEHOLDER,
  TEXT_WELCOME_PREFIX,
} from '@/constants/dashboard';
import { FIELD_FIRST_NAME } from '@/constants/fields';
import { ROUTE_CONSULTATION_BOOKING } from '@/constants/routes';
import { STATUS_ALL, STATUS_COMPLETE, STATUS_INCOMPLETE, STATUS_PENDING, STATUS_UPCOMING } from '@/constants/status';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/lib/shadcn/components/ui/alert-dialog';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Input } from '@/lib/shadcn/components/ui/input';
import { useUserDetails } from '@/lib/supabase/auth-provider';
import { ConsultationActionType, ConsultationFilterOption, ConsultationRowWithStatus } from '@/types/global';
import { ListFilter, Loader2, Plus, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import DashboardStats from './dashboard-stats';

const getActionModalContent = (actionType: ConsultationActionType | null) => {
  switch (actionType) {
    case STATUS_COMPLETE:
      return {
        title: TEXT_MARK_COMPLETE_TITLE,
        description: TEXT_MARK_COMPLETE_DESCRIPTION,
      };
    case STATUS_INCOMPLETE:
      return {
        title: TEXT_MARK_INCOMPLETE_TITLE,
        description: TEXT_MARK_INCOMPLETE_DESCRIPTION,
      };
    default:
      return {
        title: '',
        description: '',
      };
  }
};

export function StudentDashboard() {
  const router = useRouter();
  const userDetails = useUserDetails();

  const [consultationList, setConsultationList] = useState<ConsultationRowWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreItems, setHasMoreItems] = useState(false);
  const [shouldDisplayError, setShouldDisplayError] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConsultationFilterOption>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedConsultationData, setSelectedConsultationData] = useState<ConsultationRowWithStatus | null>(null);
  const [modalConfirmError, setModalConfirmError] = useState<string | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<ConsultationActionType | null>(null);
  const [isModalConfirmLoading, setIsModalConfirmLoading] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  // Stable ref so the IntersectionObserver callback always calls the latest loadMore
  // without needing to re-create the observer on every render.
  const loadMoreConsultationItemRef = useRef<() => void>(() => {});

  const handleGetConsultationList = async () => {
    try {
      setIsLoading(true);
      setShouldDisplayError(false);

      const { success, data, hasMore } = await getConsultationList({
        offset: 0,
        limit: PAGINATION_SIZE,
        search: debouncedSearch,
        filter: statusFilter,
      });

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
    router.push(ROUTE_CONSULTATION_BOOKING);
  };

  const handleModalClose = () => {
    setActionModalOpen(false);
    setModalConfirmError(null);
    setSelectedConsultationData(null);
  };

  const handleModalConfirm = async ({
    consultationId,
    actionType,
  }: {
    consultationId: ConsultationRowWithStatus['id'];
    actionType: ConsultationActionType;
  }) => {
    setIsModalConfirmLoading(true);

    let isCompleted = null;
    switch (actionType) {
      case STATUS_COMPLETE:
        isCompleted = true;
        break;
      case STATUS_INCOMPLETE:
        isCompleted = false;
        break;
    }

    try {
      const { success } = await markConsultation({ id: consultationId, is_completed: isCompleted });

      if (success) {
        setConsultationList((prev) => {
          return prev.map((item) => {
            return item.id === consultationId ? { ...item, status: actionType } : item;
          });
        });
        setIsModalConfirmLoading(false);
        handleModalClose();
      } else {
        setModalConfirmError(ERROR_SOMETHING_WENT_WRONG);
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
      setModalConfirmError(ERROR_SOMETHING_WENT_WRONG);
    } finally {
      setIsModalConfirmLoading(false);
    }
  };

  const loadMoreConsultationItem = useCallback(async () => {
    try {
      setIsLoadingMore(true);

      const offset = consultationList.length;
      const { success, data, hasMore } = await getConsultationList({
        offset,
        limit: PAGINATION_SIZE,
        search: debouncedSearch,
        filter: statusFilter,
      });

      if (success) {
        setConsultationList((prev) => {
          return [...prev, ...data];
        });
        setHasMoreItems(hasMore);
      }
    } catch (error) {
      console.error('Error loading more consultations:', error);
      setShouldDisplayError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [consultationList.length, debouncedSearch, statusFilter]);

  // Callback ref attached to the last consultation card.
  // When that element scrolls into view, it triggers the next page fetch.
  const lastConsultationItemRef = useCallback(
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
          loadMoreConsultationItemRef.current();
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
    loadMoreConsultationItemRef.current = loadMoreConsultationItem;
  }, [loadMoreConsultationItem]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    handleGetConsultationList();
  }, [debouncedSearch, statusFilter]);

  const actionModalContent = getActionModalContent(modalActionType);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Greeting and actions section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-foreground text-2xl font-bold text-balance sm:text-3xl">
            {userDetails ? `${TEXT_WELCOME_PREFIX}${userDetails[FIELD_FIRST_NAME]}` : TEXT_MY_CONSULTATIONS}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{TEXT_DASHBOARD_SUBTITLE}</p>
        </div>
        <Button
          onClick={() => {
            handleBookConsultationClick();
          }}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {TEXT_BOOK_CONSULTATION}
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={TEXT_SEARCH_PLACEHOLDER}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="pl-10"
            aria-label={TEXT_SEARCH_ARIA_LABEL}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ListFilter className="text-muted-foreground h-4 w-4" aria-hidden="true" />
          {[STATUS_ALL, STATUS_UPCOMING, STATUS_PENDING, STATUS_COMPLETE, STATUS_INCOMPLETE].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              data-is-active={statusFilter === status}
              size="sm"
              onClick={() => {
                setStatusFilter(status);
              }}
              className="data-[is-active=true]:border-primary capitalize data-[is-active=true]:border"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Consultation list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: PAGINATION_SIZE }).map((_, i) => (
            <ConsultationCardSkeleton key={i} />
          ))}
        </div>
      ) : shouldDisplayError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-yellow-300 bg-yellow-50 py-16 text-center dark:border-yellow-700 dark:bg-yellow-950">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <TriangleAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="font-display text-lg font-semibold text-yellow-800 dark:text-yellow-200">{ERROR_TITLE}</h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">{ERROR_DESCRIPTION}</p>
          <Button
            onClick={() => {
              handleGetConsultationList();
            }}
            className="mt-4 gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            {TEXT_RETRY}
          </Button>
        </div>
      ) : consultationList.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-5 w-5" />
          </div>
          <h3 className="font-display text-foreground text-lg font-semibold">{TEXT_NO_CONSULTATIONS_TITLE}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{TEXT_NO_CONSULTATIONS_DESCRIPTION}</p>

          <Button
            onClick={() => {
              handleBookConsultationClick();
            }}
            className="mt-4 gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {TEXT_BOOK_CONSULTATION}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {consultationList.map((consultation, index) => (
            <div
              key={`consultation-item-${consultation.id}`}
              ref={index === consultationList.length - 1 ? lastConsultationItemRef : undefined}
            >
              <ConsultationCard
                consultation={consultation}
                setActionModalOpen={setActionModalOpen}
                setSelectedConsultationData={setSelectedConsultationData}
                setModalActionType={setModalActionType}
              />
            </div>
          ))}
          {!!isLoadingMore &&
            Array.from({ length: PAGINATION_SIZE }).map((_, i) => (
              <ConsultationCardSkeleton key={`loading-more-${i}`} />
            ))}
        </div>
      )}

      {/* Confirmation modal */}
      <AlertDialog
        open={actionModalOpen}
        onOpenChange={(open) => {
          setActionModalOpen(open);
        }}
      >
        <AlertDialogContent
          onOverlayClick={() => {
            return !isModalConfirmLoading && setActionModalOpen(false);
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">{actionModalContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{actionModalContent.description}</AlertDialogDescription>
            {modalConfirmError && <p className="text-destructive text-sm">{modalConfirmError}</p>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={!actionModalOpen || isModalConfirmLoading}
              onClick={(e) => {
                e.preventDefault();
                if (!actionModalOpen || isModalConfirmLoading) {
                  return;
                }
                handleModalClose();
              }}
            >
              {TEXT_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!actionModalOpen || isModalConfirmLoading}
              onClick={async (e) => {
                e.preventDefault();
                if (!actionModalOpen || !modalActionType || isModalConfirmLoading || !selectedConsultationData) {
                  return;
                }

                handleModalConfirm({ consultationId: selectedConsultationData.id, actionType: modalActionType });
              }}
            >
              {isModalConfirmLoading ? <Loader2 className="mx-4.75 h-4 w-4 animate-spin" /> : TEXT_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
