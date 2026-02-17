'use server';

import { createClient, getAuthenticatedUserId } from '@/lib/supabase/server';
import { rethrowRedirectError } from '@/utils/error-utils';

export async function createConsultation(formData: {
  firstName: string;
  lastName: string;
  reason: string;
  scheduledAt: Date;
}) {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId();

    const { error } = await supabase.from('consultations').insert({
      user_id: userId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      reason: formData.reason,
      scheduled_at: formData.scheduledAt.toISOString(),
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
