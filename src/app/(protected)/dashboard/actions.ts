'use server';

import { createClient } from '@/lib/supabase/server';
import { getDerivedConsultationStatus } from '@/utils/status-utils';
import { redirect } from 'next/navigation';

export async function getConsultationList() {
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

    const { data, error } = await supabase.from('consultations').select('*').eq('user_id', userId);

    if (error) {
      return { success: false, data: [] };
    }

    const consultationList = data.map((consultation) => {
      return { ...consultation, status: getDerivedConsultationStatus(consultation) };
    });

    return { success: true, data: consultationList || [] };
  } catch (error) {
    return {
      success: false,
      data: [],
    };
  }
}
