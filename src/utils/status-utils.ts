import { STATUS_COMPLETE, STATUS_INCOMPLETE, STATUS_PENDING, STATUS_UPCOMING } from '@/constants/status';
import { ConsultationRow, ConsultationStatus } from '@/types/global';

export const getDerivedConsultationStatus = (consultation: ConsultationRow): ConsultationStatus => {
  const now = new Date();
  const scheduled = new Date(consultation.scheduled_at);

  if (consultation.is_completed === true) {
    return STATUS_COMPLETE;
  }

  if (consultation.is_completed === false) {
    return STATUS_INCOMPLETE;
  }

  // If is_completed is null
  return scheduled > now ? STATUS_UPCOMING : STATUS_PENDING;
};
