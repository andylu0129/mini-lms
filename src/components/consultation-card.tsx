'use client';

import { markConsultation } from '@/app/(protected)/dashboard/actions';
import { ERROR_SOMETHING_WENT_WRONG, TEXT_CANCEL } from '@/constants/common';
import {
  TEXT_CONFIRM,
  TEXT_MARK_COMPLETE_DESCRIPTION,
  TEXT_MARK_COMPLETE_TITLE,
  TEXT_MARK_INCOMPLETE_DESCRIPTION,
  TEXT_MARK_INCOMPLETE_TITLE,
  TEXT_STATUS_COMPLETE,
  TEXT_STATUS_INCOMPLETE,
  TEXT_STATUS_PENDING,
  TEXT_STATUS_UPCOMING,
} from '@/constants/consultation-card';
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
import { Badge } from '@/lib/shadcn/components/ui/badge';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent } from '@/lib/shadcn/components/ui/card';
import { ConsultationRowWithStatus, ConsultationStatus } from '@/types/global';
import { ArrowRightCircle, Calendar, CheckCircle2, Circle, Clock, Loader2, XCircle } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

type ActionType = Extract<ConsultationStatus, 'complete' | 'incomplete'>;

const badgeMap: Record<ConsultationStatus, React.ReactNode> = {
  upcoming: (
    <Badge variant="secondary" className="border-0 text-xs">
      {TEXT_STATUS_UPCOMING}
    </Badge>
  ),
  pending: <Badge className="bg-accent/20 text-accent-foreground border-0 text-xs">{TEXT_STATUS_PENDING}</Badge>,
  complete: (
    <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-0 text-xs">{TEXT_STATUS_COMPLETE}</Badge>
  ),
  incomplete: (
    <Badge variant="destructive" className="border-0 text-xs">
      {TEXT_STATUS_INCOMPLETE}
    </Badge>
  ),
};

const iconMap: Record<ConsultationStatus, React.ReactNode> = {
  upcoming: <ArrowRightCircle className="text-muted-foreground h-5 w-5" aria-hidden="true" />,
  pending: <Circle className="text-accent h-5 w-5" aria-hidden="true" />,
  complete: <CheckCircle2 className="text-primary h-5 w-5" aria-hidden="true" />,
  incomplete: <XCircle className="text-destructive h-5 w-5" aria-hidden="true" />,
};

const cardStyleMap: Record<ConsultationStatus, string> = {
  upcoming: 'border-border bg-card',
  pending: 'border-accent/30 bg-accent/5',
  complete: 'border-primary/30 bg-primary/5',
  incomplete: 'border-destructive/30 bg-destructive/5',
};

const getConfirmModalContent = (actionType: ActionType) => {
  switch (actionType) {
    case 'complete':
      return {
        title: TEXT_MARK_COMPLETE_TITLE,
        description: TEXT_MARK_COMPLETE_DESCRIPTION,
      };
    case 'incomplete':
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

export function ConsultationCard({ consultation }: { consultation: ConsultationRowWithStatus }) {
  const [consultationStatus, setConsultationStatus] = useState<ConsultationStatus>(consultation.status);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalContent, setConfirmModalContent] = useState({
    title: '',
    description: '',
  });

  const dateObject = new Date(consultation.scheduled_at);
  const formattedDate = moment(dateObject).format('DD MMM YYYY'); // e.g., 16 Feb 2026
  const formattedTime = moment(dateObject).format('hh:mm a'); // e.g., 08:45 pm

  const handleActionButtonClick = (actionType: ActionType) => {
    const { title, description } = getConfirmModalContent(actionType);
    setConfirmModalContent({ title: title, description: description });
    setActionType(actionType);
    setError(null);
    setConfirmModalOpen(true);
  };

  const handleConfirm = async (actionType: ActionType) => {
    setIsLoading(true);

    let isCompleted = null;
    switch (actionType) {
      case 'complete':
        isCompleted = true;
        break;
      case 'incomplete':
        isCompleted = false;
        break;
    }

    try {
      const result = await markConsultation({ id: consultation.id, is_completed: isCompleted });

      if (result.success) {
        setConsultationStatus(actionType);
        setIsLoading(false);
        setConfirmModalOpen(false);
        setError(null);
      } else {
        setError(ERROR_SOMETHING_WENT_WRONG);
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
      setError(ERROR_SOMETHING_WENT_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setConfirmModalOpen(false);
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${cardStyleMap[consultationStatus]}`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            {/* Header section */}
            <div className="flex items-start gap-3">
              <div className="mt-px shrink-0">{iconMap[consultationStatus]}</div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2 space-x-2">
                  <h3
                    data-is-complete={consultationStatus === 'complete'}
                    className={
                      'data-[is-complete=true]:text-text-muted-foreground data-[is-complete=false]:text-foreground min-w-0 flex-1 text-sm font-semibold text-wrap data-[is-complete=true]:line-through'
                    }
                  >
                    {consultation.reason}
                  </h3>
                  <span className="flex shrink-0 items-start">{badgeMap[consultationStatus]}</span>
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {formattedTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Action row only displays for past consultations (not upcoming status) */}
            {consultationStatus !== 'upcoming' && (
              <div className="border-border flex justify-end gap-2 border-t pt-3">
                {consultationStatus === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleActionButtonClick('incomplete');
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {TEXT_STATUS_INCOMPLETE}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        handleActionButtonClick('complete');
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {TEXT_STATUS_COMPLETE}
                    </Button>
                  </>
                )}
                {consultationStatus === 'complete' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleActionButtonClick('incomplete');
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {TEXT_STATUS_INCOMPLETE}
                  </Button>
                )}
                {consultationStatus === 'incomplete' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      handleActionButtonClick('complete');
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {TEXT_STATUS_COMPLETE}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation modal */}
      <AlertDialog
        open={confirmModalOpen}
        onOpenChange={(open) => {
          setConfirmModalOpen(open);
        }}
      >
        <AlertDialogContent
          onOverlayClick={() => {
            return !isLoading && setConfirmModalOpen(false);
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">{confirmModalContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmModalContent.description}</AlertDialogDescription>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={!confirmModalOpen || isLoading}
              onClick={(e) => {
                e.preventDefault();
                if (!confirmModalOpen || isLoading) {
                  return;
                }
                handleCancel();
              }}
            >
              {TEXT_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!confirmModalOpen || isLoading}
              onClick={async (e) => {
                e.preventDefault();
                if (!confirmModalOpen || !actionType || isLoading) {
                  return;
                }

                handleConfirm(actionType);
              }}
            >
              {isLoading ? <Loader2 className="mx-4.25 h-4 w-4 animate-spin" /> : TEXT_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
