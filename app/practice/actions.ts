'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getPastAttemptsAction() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not authenticated' };

    const { data: attempts, error } = await supabase
        .from('attempts')
        .select('*, exams(title)')
        .eq('student_id', user.id)
        .eq('is_submitted', true)
        .order('end_time', { ascending: false });

    if (error) {
        return { success: false, message: `Failed to fetch past attempts: ${error.message}` };
    }

    return { success: true, attempts: attempts };
}
