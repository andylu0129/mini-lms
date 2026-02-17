'use server';

import { TABLE_CONSULTATIONS } from '@/constants/common';
import { clearAuthCookies, createClient, getVerifiedUserData } from '@/lib/supabase/server';
import { ConsultationRow } from '@/types/global';
import { rethrowRedirectError } from '@/utils/error-utils';
import { getDerivedConsultationStatus } from '@/utils/status-utils';

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    await clearAuthCookies();
  } catch (error) {
    // Clear auth cookies even if sign-out fails to prevent auto-authentication.
    await clearAuthCookies();
  }
}

export async function getConsultationList({ offset = 0, limit = 5 }: { offset: number; limit: number }) {
  try {
    const supabase = await createClient();
    const { userId } = await getVerifiedUserData();

    const { data, error } = await supabase
      .from(TABLE_CONSULTATIONS)
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1); // .range() is inclusive on both ends, so subtract 1

    if (error) {
      return { success: false, data: [], hasMore: false };
    }

    const consultationList = data.map((consultation) => {
      return { ...consultation, status: getDerivedConsultationStatus(consultation) };
    });

    // If we got back exactly `limit` rows, there are likely more to fetch.
    return { success: true, data: consultationList || [], hasMore: data.length === limit };
  } catch (error) {
    rethrowRedirectError(error);
    return {
      success: false,
      data: [],
      hasMore: false,
    };
  }
}

export async function markConsultation(data: Pick<ConsultationRow, 'id' | 'is_completed'>) {
  try {
    const supabase = await createClient();
    const { userId } = await getVerifiedUserData();

    const { error } = await supabase
      .from(TABLE_CONSULTATIONS)
      .update({ is_completed: data.is_completed })
      .eq('id', data.id)
      .eq('user_id', userId);

    if (error) {
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    rethrowRedirectError(error);
    return { success: false };
  }
}
