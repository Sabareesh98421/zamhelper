'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getIncorrectlyAnsweredQuestionsAction } from './actions';
import type { Question, QuestionOption } from '@/lib/types';

interface PracticeQuestion extends Question {
    options: QuestionOption[];
}

export default function PracticeSession() {
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const attemptId = searchParams.get('attemptId');

    useEffect(() => {
        if (!attemptId) {
            setError("No attempt ID provided.");
            setLoading(false);
            return;
        }

        const fetchIncorrectQuestions = async () => {
            setLoading(true);
            const result = await getIncorrectlyAnsweredQuestionsAction(Number(attemptId));
            if (result.success && result.questions) {
                if (result.questions.length === 0) {
                    setError("No incorrect answers to practice from this attempt. Great job!");
                } else {
                    setQuestions(result.questions as any);
                }
            } else {
                setError(result.message || "Failed to load practice session.");
            }
            setLoading(false);
        };

        fetchIncorrectQuestions();
    }, [attemptId]);

    const handleCheckAnswer = () => {
        if (selectedOptionId === null) return;
        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsAnswered(false);
            setSelectedOptionId(null);
        } else {
            // End of practice session
            router.push('/practice');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="text-2xl font-bold">Loading Practice Session...</div></div>;
    if (error) return (
        <div className="flex flex-col justify-center items-center h-screen text-center">
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <button onClick={() => router.push('/practice')} className="px-6 py-2 bg-blue-500 text-white rounded-lg">Back to Practice Menu</button>
        </div>
    );
    if (questions.length === 0) return <div className="text-center p-10">No incorrect questions to practice.</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const correctOption = currentQuestion.options.find(o => o.is_correct);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Practice Session: Incorrectly Answered</h1>
                <p className="text-gray-600 dark:text-gray-300">Question {currentQuestionIndex + 1} of {questions.length}</p>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <p className="text-xl font-medium text-gray-900 dark:text-white mb-5">{currentQuestion.question_text}</p>
                    <div className="space-y-4">
                        {currentQuestion.options.map(option => {
                            const isSelected = selectedOptionId === option.id;
                            let optionClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-400";
                            if (isAnswered) {
                                if (option.is_correct) optionClass = "bg-green-100 dark:bg-green-900/50 border-green-500";
                                else if (isSelected) optionClass = "bg-red-100 dark:bg-red-900/50 border-red-500";
                            }

                            return (
                                <label key={option.id} className={`flex items-center p-4 rounded-lg border-2 transition-all ${isAnswered ? '' : 'cursor-pointer'} ${optionClass}`}>
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value={option.id}
                                        checked={isSelected}
                                        onChange={() => !isAnswered && setSelectedOptionId(option.id)}
                                        disabled={isAnswered}
                                        className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 sr-only"
                                    />
                                    <span className="ml-3 text-lg text-gray-700 dark:text-gray-200">{option.option_text}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {isAnswered && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200">Explanation</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{currentQuestion.explanation || "No explanation provided."}</p>
                    </div>
                )}

                <div className="flex justify-end">
                    {!isAnswered ? (
                        <button onClick={handleCheckAnswer} disabled={selectedOptionId === null} className="px-6 py-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors">
                            Check Answer
                        </button>
                    ) : (
                        <button onClick={handleNext} className="px-6 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors">
                            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
