
'use server'

import { supabase } from '@/app/lib/supabase'; // Use Supabase client

export interface Question {
    id: string;
    question: string;
    options: string[];
    answer: string;
    pdf_upload_id: string; // Foreign key to the exam
}

export type PublicQuestion = Omit<Question, 'answer'>;

// This function is fine, it does not interact with the database
async function parseQuestions(content: string): Promise<Omit<Question, 'id' | 'pdf_upload_id'>[]> {
    const questions: Omit<Question, 'id' | 'pdf_upload_id'>[] = [];
    const lines = content.split('\n');
    let currentQuestion: Partial<Omit<Question, 'id' | 'pdf_upload_id'> & { question: string }> = {};

    for (const line of lines) {
        const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (questionMatch) {
            if (currentQuestion.question) {
                questions.push(currentQuestion as Omit<Question, 'id' | 'pdf_upload_id'>);
            }
            currentQuestion = { question: questionMatch[2].trim(), options: [] };
        } else if (currentQuestion.question) {
            const optionMatch = line.match(/^([A-D])\)\s+(.*)/);
            if (optionMatch) {
                currentQuestion.options?.push(optionMatch[2].trim());
            } else {
                const answerMatch = line.match(/^Answer:\s+([A-D])/);
                if (answerMatch) {
                    currentQuestion.answer = answerMatch[1];
                }
            }
        }
    }

    if (currentQuestion.question) {
        questions.push(currentQuestion as Omit<Question, 'id' | 'pdf_upload_id'>);
    }

    return questions;
}

// Rewritten function using Supabase
export async function getOrCreateQuestions(examId: string): Promise<PublicQuestion[]> {
    // 1. Check if questions for this exam already exist in Supabase
    const { data: existingQuestions, error: selectError } = await supabase
        .from('questions')
        .select('id, question, options, pdf_upload_id') // Select only public fields
        .eq('pdf_upload_id', examId);

    if (selectError) {
        console.error('Error fetching questions:', selectError);
        throw new Error('Could not fetch questions.');
    }

    // 2. If questions exist, return them
    if (existingQuestions && existingQuestions.length > 0) {
        return existingQuestions;
    }

    // 3. If not, get the exam content from the pdf_uploads table
    const { data: examData, error: examError } = await supabase
        .from('pdf_uploads')
        .select('content')
        .eq('id', examId)
        .single();

    if (examError || !examData) {
        console.error('Error fetching exam content:', examError);
        throw new Error('Exam not found');
    }

    // 4. Parse the raw content into structured questions
    const questionsToCreate = await parseQuestions(examData.content || '');

    const questionsToInsert = questionsToCreate.map(q => ({ ...q, pdf_upload_id: examId }));

    // 5. Insert the new questions into the database
    const { data: newQuestions, error: insertError } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select('id, question, options, pdf_upload_id'); // Return the newly created public questions

    if (insertError) {
        console.error('Error creating questions:', insertError);
        throw new Error('Could not create questions.');
    }

    return newQuestions || [];
}
