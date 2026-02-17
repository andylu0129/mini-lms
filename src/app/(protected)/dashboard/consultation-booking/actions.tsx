'use server';

import { createClient, getVerifiedUserData } from '@/lib/supabase/server';
import { ConsultationRow } from '@/types/global';
import { rethrowRedirectError } from '@/utils/error-utils';

export async function createConsultation(formData: Pick<ConsultationRow, 'reason' | 'scheduled_at'>) {
  try {
    const supabase = await createClient();
    const { userId, firstName, lastName } = await getVerifiedUserData();

    const { error } = await supabase.from('consultations').insert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      reason: formData.reason,
      scheduled_at: formData.scheduled_at,
    });

    if (error) {
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    rethrowRedirectError(error);
    return { success: false };
  }
}
