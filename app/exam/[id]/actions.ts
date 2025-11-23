'use server';

import { createClient } from '@/lib/supabase/server';

export async function getExamQuestionsAction(examId: number) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not authenticated' };

    // Check for an existing, non-submitted attempt
    let { data: attempt, error: attemptError } = await supabase
        .from('attempts')
        .select('id')
        .eq('exam_id', examId)
        .eq('student_id', user.id)
        .eq('is_submitted', false)
        .single();

    // If no active attempt, create one
    if (attemptError || !attempt) {
        const { data: newAttempt, error: newAttemptError } = await supabase
            .from('attempts')
            .insert({ exam_id: examId, student_id: user.id, start_time: new Date().toISOString() })
            .select('id')
            .single();

        if (newAttemptError) return { success: false, message: `Failed to create new attempt: ${newAttemptError.message}` };
        attempt = newAttempt;
    }

    // Fetch exam questions
    const { data: questions, error: questionsError } = await supabase
        .from('exam_questions')
        .select('*, questions(*, question_options(*))')
        .eq('exam_id', examId)
        .order('display_order');

    if (questionsError) return { success: false, message: `Failed to fetch questions: ${questionsError.message}` };

    const formattedQuestions = questions.map(q => ({
        ...(q.questions as any),
        options: q.questions.question_options
    }));

    return { success: true, questions: formattedQuestions, attemptId: attempt.id };
}

export async function submitExamAction(attemptId: number, answers: Record<number, number>) {
    const supabase = createClient();

    // 1. Get all questions for the exam to check answers against
    const { data: attemptData } = await supabase.from('attempts').select('exam_id').eq('id', attemptId).single();
    if (!attemptData) return { success: false, message: "Attempt not found" };

    const { data: correctOptions } = await supabase
        .from('question_options')
        .select('question_id, id')
        .eq('is_correct', true)
        .in('question_id', Object.keys(answers).map(Number));

    if (!correctOptions) return { success: false, message: "Couldn't verify answers" };

    const correctAnswersMap = new Map(correctOptions.map(o => [o.question_id, o.id]));

    // 2. Grade the answers
    let score = 0;
    const attemptAnswers = Object.entries(answers).map(([questionIdStr, selectedOptionId]) => {
        const questionId = Number(questionIdStr);
        const correctOptionId = correctAnswersMap.get(questionId);
        const isCorrect = correctOptionId === selectedOptionId;
        if (isCorrect) score++;
        return {
            attempt_id: attemptId,
            question_id: questionId,
            selected_option_id: selectedOptionId,
            is_correct: isCorrect,
        };
    });
    
    const finalScore = (score / Object.keys(answers).length) * 100;

    // 3. Save the answers and update the attempt record
    const { error: saveError } = await supabase.from('attempt_answers').insert(attemptAnswers);
    if (saveError) return { success: false, message: `Failed to save answers: ${saveError.message}` };

    const { error: updateError } = await supabase
        .from('attempts')
        .update({ is_submitted: true, end_time: new Date().toISOString(), score: finalScore })
        .eq('id', attemptId);

    if (updateError) return { success: false, message: `Failed to finalize attempt: ${updateError.message}` };

    return { success: true, message: 'Exam submitted successfully!', attemptId: attemptId };
}
