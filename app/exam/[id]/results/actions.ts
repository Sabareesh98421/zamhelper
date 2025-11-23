'use server';

import { createClient } from '@/lib/supabase/server';

export async function getExamResultsAction(attemptId: number) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not authenticated' };

    // Fetch the attempt details, ensuring it belongs to the current user
    const { data: attempt, error: attemptError } = await supabase
        .from('attempts')
        .select('*, exams(*)')
        .eq('id', attemptId)
        .eq('student_id', user.id)
        .single();

    if (attemptError || !attempt) {
        return { success: false, message: 'Exam attempt not found or access denied.' };
    }

    // Fetch the answers for this attempt, along with the question and all its options
    const { data: answers, error: answersError } = await supabase
        .from('attempt_answers')
        .select('*, questions(*, question_options(*))')
        .eq('attempt_id', attemptId);

    if (answersError) {
        return { success: false, message: `Failed to fetch exam results: ${answersError.message}` };
    }

    const results = { // Added a name for the object
      attempt: attempt,
      answers: answers
    }

    return { success: true, results: results };
}
