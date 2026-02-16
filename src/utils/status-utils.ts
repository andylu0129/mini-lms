import { ConsultationRow, ConsultationStatus } from '@/types/global';

export const getDerivedConsultationStatus = (consultation: ConsultationRow): ConsultationStatus => {
  const now = new Date();
  const scheduled = new Date(consultation.scheduled_at);

  if (consultation.is_completed === true) {
    return 'complete';
  }

  if (consultation.is_completed === false) {
    return 'incomplete';
  }

  // If is_completed is null
  return scheduled > now ? 'upcoming' : 'pending';
};
