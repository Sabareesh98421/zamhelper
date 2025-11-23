'use server'

import { createClient } from '@/lib/supabase/server';

export async function getIncorrectlyAnsweredQuestionsAction(attemptId: number) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not authenticated' };

    const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .select('id')
        .eq('id', attemptId)
        .eq('student_id', user.id)
        .single();

    if (attemptError || !attemptData) {
        return { success: false, message: 'Attempt not found or access denied.' };
    }

    const { data: incorrectAnswers, error: incorrectAnswersError } = await supabase
        .from('attempt_answers')
        .select('questions(*, question_options(*))')
        .eq('attempt_id', attemptId)
        .eq('is_correct', false);

    if (incorrectAnswersError) {
        return {
            success: false,
            message: `Failed to fetch incorrect answers: ${incorrectAnswersError.message}`
        };
    }

    // CORRECTION: handle questions as an array
    const questions = incorrectAnswers.flatMap(a => {
        // The property name from the query is `questions`, not `question`.
        // Also, it's possible for `a.questions` to be null.
        return (a.questions || []).map((q: any) => ({
            id: q.id,
            question_text: q.question_text, // Ensure this matches your column name
            explanation: q.explanation,
            options: q.question_options || []
        }));
    });

    return { success: true, questions };
}
