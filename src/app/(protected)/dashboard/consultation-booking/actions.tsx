'use server';

import { createClient, getAuthenticatedUserId } from '@/lib/supabase/server';
import { ConsultationRow } from '@/types/global';
import { rethrowRedirectError } from '@/utils/error-utils';

export async function createConsultation(
  formData: Pick<ConsultationRow, 'first_name' | 'last_name' | 'reason' | 'scheduled_at'>,
) {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId();

    const { error } = await supabase.from('consultations').insert({
      user_id: userId,
      first_name: formData.first_name,
      last_name: formData.last_name,
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
