
'use server'

import { db } from '@/app/lib/firebase';
import { doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';

export interface Question {
    id: string;
    question: string;
    options: string[];
    answer: string;
}

export type PublicQuestion = Omit<Question, 'answer'>;

async function parseQuestions(content: string): Promise<Omit<Question, 'id'>[]> {
    const questions: Omit<Question, 'id'>[] = [];
    const lines = content.split('\n');
    let currentQuestion: Partial<Omit<Question, 'id'> & { question: string }> = {};

    for (const line of lines) {
        const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (questionMatch) {
            if (currentQuestion.question) {
                questions.push(currentQuestion as Omit<Question, 'id'>);
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
        questions.push(currentQuestion as Omit<Question, 'id'>);
    }

    return questions;
}

export async function getOrCreateQuestions(examId: string): Promise<PublicQuestion[]> {
    const examRef = doc(db, 'exams', examId);
    const questionsCollectionRef = collection(examRef, 'questions');

    const questionsSnapshot = await getDocs(questionsCollectionRef);
    if (!questionsSnapshot.empty) {
        return questionsSnapshot.docs.map(doc => {
            const { answer, ...rest } = doc.data();
            return { id: doc.id, ...rest } as PublicQuestion;
        });
    }

    const examDoc = await getDoc(examRef);
    if (!examDoc.exists()) {
        throw new Error('Exam not found');
    }

    const examData = examDoc.data();
    const questionsToCreate = await parseQuestions(examData.content);

    for (const q of questionsToCreate) {
        await addDoc(questionsCollectionRef, q);
    }

    const newQuestionsSnapshot = await getDocs(questionsCollectionRef);
    return newQuestionsSnapshot.docs.map(doc => {
        const { answer, ...rest } = doc.data();
        return { id: doc.id, ...rest } as PublicQuestion;
    });
}
