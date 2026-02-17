'use client';

import {
  TEXT_STATUS_COMPLETE,
  TEXT_STATUS_INCOMPLETE,
  TEXT_STATUS_PENDING,
  TEXT_STATUS_UPCOMING,
} from '@/constants/consultation-card';
import { STATUS_COMPLETE, STATUS_INCOMPLETE, STATUS_PENDING, STATUS_UPCOMING } from '@/constants/status';
import { Badge } from '@/lib/shadcn/components/ui/badge';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent } from '@/lib/shadcn/components/ui/card';
import { ConsultationActionType, ConsultationRowWithStatus, ConsultationStatus } from '@/types/global';
import { ArrowRightCircle, Calendar, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import moment from 'moment';

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

export function ConsultationCard({
  consultation,
  setActionModalOpen,
  setSelectedConsultationData,
  setModalActionType,
}: {
  consultation: ConsultationRowWithStatus;
  setActionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedConsultationData: React.Dispatch<React.SetStateAction<ConsultationRowWithStatus | null>>;
  setModalActionType: React.Dispatch<React.SetStateAction<ConsultationActionType | null>>;
}) {
  const consultationStatus = consultation.status;
  const formattedDate = moment(consultation.scheduled_at).format('DD MMM YYYY'); // e.g., 16 Feb 2026
  const formattedTime = moment(consultation.scheduled_at).format('hh:mm a'); // e.g., 08:45 pm

  const handleActionButtonClick = (actionType: ConsultationActionType) => {
    setSelectedConsultationData(consultation);
    setModalActionType(actionType);
    setActionModalOpen(true);
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
                    data-is-complete={consultationStatus === STATUS_COMPLETE}
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
            {consultationStatus !== STATUS_UPCOMING && (
              <div className="border-border flex justify-end gap-2 border-t pt-3">
                {consultationStatus === STATUS_PENDING && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleActionButtonClick(STATUS_INCOMPLETE);
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
                        handleActionButtonClick(STATUS_COMPLETE);
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {TEXT_STATUS_COMPLETE}
                    </Button>
                  </>
                )}
                {consultationStatus === STATUS_COMPLETE && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleActionButtonClick(STATUS_INCOMPLETE);
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {TEXT_STATUS_INCOMPLETE}
                  </Button>
                )}
                {consultationStatus === STATUS_INCOMPLETE && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      handleActionButtonClick(STATUS_COMPLETE);
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
    </>
  );
}
