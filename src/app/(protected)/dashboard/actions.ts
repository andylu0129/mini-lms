'use server';

import {
  PL_PGSQL_GET_CONSULTATION_COUNTS_BY_STATUS,
  TABLE_CONSULTATIONS,
  VIEW_CONSULTATIONS_WITH_STATUS,
} from '@/constants/common';
import { clearAuthCookies, createClient, getVerifiedUserData } from '@/lib/supabase/server';
import { ConsultationRow } from '@/types/global';
import { rethrowRedirectError } from '@/utils/error-utils';

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
      .from(VIEW_CONSULTATIONS_WITH_STATUS)
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1); // .range() is inclusive on both ends, so subtract 1

    if (error) {
      return { success: false, data: [], hasMore: false };
    }

    // If we got back exactly `limit` rows, there are likely more to fetch.
    return { success: true, data: data || [], hasMore: data.length === limit };
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

export async function getConsultationStats() {
  try {
    const supabase = await createClient();
    const { userId } = await getVerifiedUserData();

    const { data, error } = await supabase.rpc(PL_PGSQL_GET_CONSULTATION_COUNTS_BY_STATUS, { user_id: userId });

    if (error) {
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    rethrowRedirectError(error);
    return { success: false, data: [] };
  }
}
