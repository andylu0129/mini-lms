'use client';

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
import { ArrowRightCircle, Calendar, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

export function ConsultationCard({ consultation }: { consultation: ConsultationRowWithStatus }) {
  const consultationStatus = consultation.status;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ConsultationStatus | null>(null);

  const dateObj = new Date(consultation.scheduled_at);
  const formattedDate = moment(dateObj).format('DD MMM YYYY'); // e.g., 16 Feb 2026
  const formattedTime = moment(dateObj).format('hh:mm a'); // e.g., 08:45 pm

  function handleMarkClick(newStatus: ConsultationStatus) {
    setPendingAction(newStatus);
    setConfirmOpen(true);
  }

  function handleConfirm() {
    setConfirmOpen(false);
    setPendingAction(null);
  }

  function handleCancel() {
    setConfirmOpen(false);
    setPendingAction(null);
  }

  // Badge per state
  const badgeMap: Record<ConsultationStatus, React.ReactNode> = {
    upcoming: (
      <Badge variant="secondary" className="text-xs">
        Upcoming
      </Badge>
    ),
    pending: <Badge className="bg-accent/20 text-accent-foreground border-0 text-xs">Pending</Badge>,
    complete: <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-0 text-xs">Complete</Badge>,
    incomplete: (
      <Badge variant="destructive" className="text-xs">
        Incomplete
      </Badge>
    ),
  };

  // Icon per state
  const iconMap: Record<ConsultationStatus, React.ReactNode> = {
    upcoming: <ArrowRightCircle className="text-muted-foreground h-5 w-5" aria-hidden="true" />,
    pending: <Circle className="text-accent h-5 w-5" aria-hidden="true" />,
    complete: <CheckCircle2 className="text-primary h-5 w-5" aria-hidden="true" />,
    incomplete: <XCircle className="text-destructive h-5 w-5" aria-hidden="true" />,
  };

  // Card border/bg per state
  const cardStyleMap: Record<ConsultationStatus, string> = {
    upcoming: 'border-border bg-card',
    pending: 'border-accent/30 bg-accent/5',
    complete: 'border-primary/30 bg-primary/5',
    incomplete: 'border-destructive/30 bg-destructive/5',
  };

  // Confirmation dialog label
  const confirmLabel = pendingAction === 'complete' ? 'Mark as Complete?' : 'Mark as Incomplete?';
  const confirmDescription =
    pendingAction === 'complete'
      ? 'This will mark the consultation as complete. You can change this later.'
      : 'This will mark the consultation as incomplete. You can change this later.';

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
                    className={`min-w-0 flex-1 text-sm font-semibold text-wrap ${
                      consultationStatus === 'complete' ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}
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

            {/* Action row only displays for past consultations (not upcoming) */}
            {consultationStatus !== 'upcoming' && (
              <div className="border-border flex justify-end gap-2 border-t pt-3">
                {consultationStatus === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleMarkClick('incomplete');
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Mark as Incomplete
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        handleMarkClick('complete');
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark as Complete
                    </Button>
                  </>
                )}
                {consultationStatus === 'complete' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleMarkClick('incomplete');
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Mark as Incomplete
                  </Button>
                )}
                {consultationStatus === 'incomplete' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      handleMarkClick('complete');
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark as Complete
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">{confirmLabel}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                handleCancel();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleConfirm();
              }}
            >
              {pendingAction === 'complete' ? 'Yes, mark complete' : 'Yes, mark incomplete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
