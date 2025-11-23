"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { getExamResultsAction } from './actions';
import type { Attempt, AttemptAnswer, Question, QuestionOption, Exam } from '@/lib/types';

interface AnswerDetails extends AttemptAnswer {
    questions: Question & {
        question_options: QuestionOption[];
    };
}

interface ExamResults {
    attempt: Attempt & { exams: Exam };
    answers: AnswerDetails[];
}

export default function ResultsPage() {
    const [results, setResults] = useState<ExamResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const attemptId = searchParams.get('attemptId');
    const examId = params.id;

    useEffect(() => {
        if (!attemptId) {
            setError("No attempt ID found in the URL.");
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            const result = await getExamResultsAction(Number(attemptId));
            if (result.success && result.results) {
                setResults(result.results as any);
            } else {
                setError(result.message || "Failed to load exam results.");
            }
            setLoading(false);
        };

        fetchResults();
    }, [attemptId]);

    const getOptionText = (question: any, optionId: number | null) => {
        if (!optionId) return "Not answered";
        const option = question.question_options.find((o: any) => o.id === optionId);
        return option ? option.option_text : "Invalid option";
    };

    const getCorrectOption = (question: any) => {
        return question.question_options.find((o: any) => o.is_correct);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="text-2xl font-bold">Loading Results...</div></div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500"><div className="text-2xl">Error: {error}</div></div>;
    if (!results) return <div className="text-center p-10">Could not retrieve exam results.</div>;

    const { attempt, answers } = results;
    const score = attempt.score ?? 0;
    const scoreColor = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center border-b pb-6 border-gray-200 dark:border-gray-700">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Exam Results</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">{attempt.exams.title}</p>
                    <p className={`text-7xl font-bold mt-4 ${scoreColor}`}>{score.toFixed(2)}%</p>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Your final score</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Answer Review</h2>
                    {answers.map((answer, index) => {
                        const question = answer.questions;
                        const correctOption = getCorrectOption(question);
                        const isCorrect = answer.is_correct;
                        return (
                            <div key={answer.id} className={`p-5 rounded-lg border-l-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">Question {index + 1}: {question.question_text}</p>
                                <div className="mt-4 space-y-2 text-sm">
                                    <p><strong>Your Answer:</strong> <span className={!isCorrect ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}>{getOptionText(question, answer.selected_option_id)}</span></p>
                                    <p><strong>Correct Answer:</strong> <span className="text-green-700 dark:text-green-400">{getOptionText(question, correctOption?.id)}</span></p>
                                    {!isCorrect && question.explanation && (
                                        <div className="pt-2">
                                            <p className="font-semibold"><strong>Explanation:</strong></p>
                                            <p className="text-gray-700 dark:text-gray-300">{question.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => router.push('/dashboard')} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
