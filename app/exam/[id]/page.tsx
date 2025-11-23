"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Question, QuestionOption } from '@/lib/types';
import { getExamQuestionsAction, submitExamAction } from './actions';

interface ExamQuestion extends Question {
    options: QuestionOption[];
}

export default function ExamPage() {
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const examId = Number(params.id);

    useEffect(() => {
        if (!examId) {
            setError("Invalid exam ID.");
            setLoading(false);
            return;
        }

        const fetchQuestions = async () => {
            setLoading(true);
            const result = await getExamQuestionsAction(examId);
            if (result.success && result.questions) {
                setQuestions(result.questions);
                setAttemptId(result.attemptId as number);
            } else {
                setError(result.message || "Failed to load exam questions.");
            }
            setLoading(false);
        };

        fetchQuestions();
    }, [examId]);

    const handleAnswerSelect = (questionId: number, optionId: number) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!attemptId || !confirm("Are you sure you want to submit your exam?")) return;

        setSubmitting(true);
        const result = await submitExamAction(attemptId, selectedAnswers);
        if (result.success) {
            router.push(`/exam/${examId}/results?attemptId=${attemptId}`);
        } else {
            setError(result.message || "Failed to submit exam.");
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="text-2xl font-bold">Loading Exam...</div></div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500"><div className="text-2xl">Error: {error}</div></div>;
    if (questions.length === 0) return <div className="text-center p-10">No questions found for this exam.</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Exam Time</h1>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <p className="text-xl font-medium text-gray-900 dark:text-white mb-5">{currentQuestion.question_text}</p>
                    <div className="space-y-4">
                        {currentQuestion.options.map(option => (
                            <label key={option.id} className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedAnswers[currentQuestion.id] === option.id ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-400'}`}>
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={option.id}
                                    checked={selectedAnswers[currentQuestion.id] === option.id}
                                    onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 sr-only"
                                />
                                <span className="ml-3 text-lg text-gray-700 dark:text-gray-200">{option.option_text}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="px-5 py-2.5 font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg disabled:opacity-50 transition-transform transform hover:scale-105">Previous</button>
                    
                    {currentQuestionIndex === questions.length - 1 ? (
                        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-transform transform hover:scale-105">
                            {submitting ? 'Submitting...' : 'Finish & Submit'}
                        </button>
                    ) : (
                        <button onClick={handleNext} className="px-5 py-2.5 font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105">Next</button>
                    )}
                </div>
            </div>
        </div>
    );
}
