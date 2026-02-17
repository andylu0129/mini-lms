'use server';

import { createClient } from '@/lib/supabase/server';
import { getDerivedConsultationStatus } from '@/utils/status-utils';

export async function getConsultationList(offset = 0, limit = 5) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId || userError) {
      return { success: false, data: [], hasMore: false };
    }

    const { data, error } = await supabase
      .from('consultations')
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
    return {
      success: false,
      data: [],
      hasMore: false,
    };
  }
}

export async function createConsultation(formData: {
  firstName: string;
  lastName: string;
  reason: string;
  scheduledAt: Date;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId || userError) {
      return { success: false };
    }

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
    return { success: false };
  }
}

export async function markConsultation(consultationId: string, isCompleted: boolean) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId || userError) {
      return { success: false };
    }

    const { error } = await supabase
      .from('consultations')
      .update({ is_completed: isCompleted })
      .eq('id', consultationId)
      .eq('user_id', userId);

    if (error) {
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
