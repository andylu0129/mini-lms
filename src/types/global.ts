import { Database } from './database';

export type ConsultationStatus = 'upcoming' | 'pending' | 'complete' | 'incomplete';
export type ConsultationRow = Database['public']['Tables']['consultations']['Row'];
export type ConsultationRowWithStatus = ConsultationRow & { status: ConsultationStatus };
export type ConsultationActionType = Extract<ConsultationStatus, 'complete' | 'incomplete'>;
export type ConsultationStatsData = Database['public']['Functions']['get_consultation_counts_by_status']['Returns'][0];
