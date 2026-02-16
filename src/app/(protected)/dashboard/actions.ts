'use server';

import { createClient } from '@/lib/supabase/server';
import { getDerivedConsultationStatus } from '@/utils/status-utils';
import { redirect } from 'next/navigation';

export async function getConsultationList(offset = 0, limit = 5) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId || sessionError) {
      redirect('/auth/sign-in');
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
