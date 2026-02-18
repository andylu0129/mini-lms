'use client';
import { COMMON_TEXT } from '@/constants/common';
import { CONSULTATION_CARD } from '@/constants/consultation-card';
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
import { ConsultationActionType, ConsultationRowWithStatus } from '@/types/global';
import { Loader2 } from 'lucide-react';

const getActionModalContent = (actionType: ConsultationActionType | null) => {
  switch (actionType) {
    case 'complete':
      return { title: CONSULTATION_CARD.MARK_COMPLETE.TITLE, description: CONSULTATION_CARD.MARK_COMPLETE.DESCRIPTION };
    case 'incomplete':
      return {
        title: CONSULTATION_CARD.MARK_INCOMPLETE.TITLE,
        description: CONSULTATION_CARD.MARK_INCOMPLETE.DESCRIPTION,
      };
    default:
      return { title: '', description: '' };
  }
};

export function ConsultationActionModal({
  isOpen,
  handleOpenChange,
  actionType,
  consultationData,
  handleConfirm,
  isLoading,
  error,
}: {
  isOpen: boolean;
  handleOpenChange: (open: boolean) => void;
  actionType: ConsultationActionType | null;
  consultationData: ConsultationRowWithStatus | null;
  handleConfirm: (data: { consultationData: ConsultationRowWithStatus; actionType: ConsultationActionType }) => void;
  isLoading: boolean;
  error?: string | null;
}) {
  const content = getActionModalContent(actionType);

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        // Only allow closing by clicking overlay if modal is not loading
        onOverlayClick={() => {
          !isLoading && handleOpenChange(false);
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">{content.title}</AlertDialogTitle>
          <AlertDialogDescription>{content.description}</AlertDialogDescription>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{COMMON_TEXT.CANCEL}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || !actionType || !consultationData}
            onClick={() => {
              if (!isOpen || !actionType || isLoading || !consultationData) {
                return;
              }
              consultationData && actionType && handleConfirm({ consultationData, actionType });
            }}
          >
            {isLoading ? <Loader2 className="mx-4.75 h-4 w-4 animate-spin" /> : CONSULTATION_CARD.CONFIRM}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
