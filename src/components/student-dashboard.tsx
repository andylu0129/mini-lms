'use client';

import { markConsultation } from '@/app/(protected)/dashboard/actions';
import { COMMON_TEXT, ERRORS } from '@/constants/common';
import { DASHBOARD } from '@/constants/dashboard';
import { FIELDS } from '@/constants/fields';
import { ROUTES } from '@/constants/routes';
import { STATUS } from '@/constants/status';
import { useConsultations } from '@/hooks/useConsultationList';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Input } from '@/lib/shadcn/components/ui/input';
import { useUserDetails } from '@/lib/supabase/auth-provider';
import { ConsultationActionType, ConsultationFilterOption, ConsultationRowWithStatus } from '@/types/global';
import { ListFilter, Plus, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConsultationActionModal } from './consultation-action-modal';
import { ConsultationCard } from './consultation-card';
import { ConsultationCardSkeleton } from './consultation-card-skeleton';
import DashboardStats from './dashboard-stats';

export function StudentDashboard() {
  const router = useRouter();
  const userDetails = useUserDetails();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConsultationFilterOption>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<ConsultationActionType | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRowWithStatus | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Debounce search input
  const debouncedSearch = useDebounce(search, DASHBOARD.SEARCH.DEBOUNCE_MS);

  const { list, stats, isLoading, isLoadingMore, isError, fetchList, lastItemRef, setList, setStats } =
    useConsultations(debouncedSearch, statusFilter);

  const handleBookConsultationClick = () => {
    router.push(ROUTES.CONSULTATION_BOOKING);
  };

  const handleModalConfirm = async ({
    consultationData,
    actionType,
  }: {
    consultationData: ConsultationRowWithStatus;
    actionType: ConsultationActionType;
  }) => {
    setModalLoading(true);

    try {
      let isCompleted = null;
      switch (actionType) {
        case STATUS.COMPLETE:
          isCompleted = true;
          break;
        case STATUS.INCOMPLETE:
          isCompleted = false;
          break;
      }
      const { success } = await markConsultation({ id: consultationData.id, is_completed: isCompleted });

      if (success) {
        setList((prev) =>
          prev.map((item) => {
            return item.id === consultationData.id ? { ...item, status: actionType } : item;
          }),
        );
        setStats((prev) => {
          return !prev
            ? prev
            : {
                ...prev,
                [consultationData.status]: Math.max(prev[consultationData.status] - 1, 0),
                [actionType]: prev[actionType] + 1,
              };
        });
        setModalOpen(false);
      } else {
        setModalError(ERRORS.SOMETHING_WENT_WRONG);
      }
    } catch {
      setModalError(ERRORS.SOMETHING_WENT_WRONG);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Greeting and actions section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-foreground text-2xl font-bold text-balance sm:text-3xl">
            {userDetails ? `${DASHBOARD.WELCOME_PREFIX}${userDetails[FIELDS.FIRST_NAME]}` : DASHBOARD.TITLE}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{DASHBOARD.SUBTITLE}</p>
        </div>
        <Button
          onClick={() => {
            handleBookConsultationClick();
          }}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {COMMON_TEXT.BOOK_CONSULTATION}
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={DASHBOARD.SEARCH.PLACEHOLDER}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="pl-10"
            aria-label={DASHBOARD.SEARCH.ARIA_LABEL}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ListFilter className="text-muted-foreground h-4 w-4" aria-hidden="true" />
          {[STATUS.ALL, STATUS.UPCOMING, STATUS.PENDING, STATUS.COMPLETE, STATUS.INCOMPLETE].map((status) => (
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
          {Array.from({ length: DASHBOARD.PAGINATION_SIZE }).map((_, i) => (
            <ConsultationCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-yellow-300 bg-yellow-50 py-16 text-center dark:border-yellow-700 dark:bg-yellow-950">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <TriangleAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="font-display text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            {DASHBOARD.ERROR.TITLE}
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">{DASHBOARD.ERROR.DESCRIPTION}</p>
          <Button
            onClick={() => {
              fetchList();
            }}
            className="mt-4 gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            {DASHBOARD.RETRY}
          </Button>
        </div>
      ) : list.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-5 w-5" />
          </div>
          <h3 className="font-display text-foreground text-lg font-semibold">{DASHBOARD.NO_CONSULTATIONS.TITLE}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{DASHBOARD.NO_CONSULTATIONS.DESCRIPTION}</p>

          <Button
            onClick={() => {
              handleBookConsultationClick();
            }}
            className="mt-4 gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {COMMON_TEXT.BOOK_CONSULTATION}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((consultation, index) => (
            <div key={`consultation-item-${consultation.id}`} ref={index === list.length - 1 ? lastItemRef : undefined}>
              <ConsultationCard
                consultation={consultation}
                setModalOpen={setModalOpen}
                setSelectedConsultation={setSelectedConsultation}
                setModalActionType={setModalActionType}
              />
            </div>
          ))}
          {!!isLoadingMore &&
            Array.from({ length: DASHBOARD.PAGINATION_SIZE }).map((_, i) => (
              <ConsultationCardSkeleton key={`loading-more-${i}`} />
            ))}
        </div>
      )}

      {/* Confirmation modal */}
      <ConsultationActionModal
        isOpen={modalOpen}
        handleOpenChange={setModalOpen}
        actionType={modalActionType}
        consultationData={selectedConsultation}
        handleConfirm={handleModalConfirm}
        isLoading={modalLoading}
        error={modalError}
      />
    </main>
  );
}
