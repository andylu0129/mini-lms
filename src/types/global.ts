import { Database } from './database';

export type ConsultationStatus = 'upcoming' | 'pending' | 'complete' | 'incomplete';
export type ConsultationRow = Database['public']['Tables']['consultations']['Row'];
export type ConsultationRowWithStatus = ConsultationRow & { status: ConsultationStatus };
