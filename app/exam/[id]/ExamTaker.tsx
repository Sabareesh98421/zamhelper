'use client';

import React, { useState } from 'react';
import { Question } from '@/app/lib/parsing';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface ExamTakerProps {
    questions: Question[];
    examTitle: string;
}

export default function ExamTaker({ questions, examTitle }: ExamTakerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({}); // questionId -> selectedOption (A, B, C...)
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const handleOptionSelect = (optionLabel: string) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionLabel
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (!confirm("Are you sure you want to submit? You cannot change answers after trying.")) return;

        let correctCount = 0;
        questions.forEach(q => {
            const selected = selectedAnswers[q.id];
            // Normalize comparison (A vs A.)
            const cleanSelected = selected ? selected.charAt(0).toUpperCase() : '';
            const cleanCorrect = q.correctAnswer ? q.correctAnswer.charAt(0).toUpperCase() : '';

            if (cleanSelected === cleanCorrect) {
                correctCount++;
            }
        });

        const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
        setScore(calculatedScore);
        setIsSubmitted(true);
    };

    // Extract option label (A. Option Text -> A)
    const getOptionLabel = (opt: string) => opt.match(/^([A-Da-d])[\.\)]/)?.[1]?.toUpperCase() || opt.charAt(0);

    return (
        <div className="max-w-4xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <Link href="/exam" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-md" title={examTitle}>
                    {examTitle}
                </h1>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
            </div>

            {/* Score Display */}
            {isSubmitted && (
                <div className={`mb-8 p-6 rounded-lg text-center ${score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    <h2 className="text-3xl font-bold mb-2">Score: {score}%</h2>
                    <p>{score >= 70 ? 'Great job! You passed.' : 'Keep practicing. You can do better!'}</p>
                </div>
            )}

            {/* Question Card */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 leading-relaxed">
                    <span className="mr-2 text-indigo-600 dark:text-indigo-400">{currentQuestion.id}.</span>
                    {currentQuestion.text}
                </h2>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                        const label = getOptionLabel(option);
                        const isSelected = selectedAnswers[currentQuestion.id] === label;
                        const isCorrect = currentQuestion.correctAnswer === label;

                        let optionClass = "w-full text-left p-4 rounded-lg border-2 transition-all flex items-center ";

                        if (isSubmitted) {
                            if (isCorrect) optionClass += "border-green-500 bg-green-50 dark:bg-green-900/30 ";
                            else if (isSelected && !isCorrect) optionClass += "border-red-500 bg-red-50 dark:bg-red-900/30 ";
                            else optionClass += "border-gray-200 dark:border-gray-700 opacity-60 ";
                        } else {
                            if (isSelected) optionClass += "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/30 ";
                            else optionClass += "border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-500 ";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(label)}
                                disabled={isSubmitted}
                                className={optionClass}
                            >
                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-4 border ${isSelected || (isSubmitted && isCorrect)
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-gray-300 text-gray-500'
                                    }`}>
                                    {label}
                                </span>
                                <span className="flex-grow text-gray-800 dark:text-gray-200">{option}</span>
                                {isSubmitted && isCorrect && <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />}
                                {isSubmitted && isSelected && !isCorrect && <XCircleIcon className="h-6 w-6 text-red-500 ml-2" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-50 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" /> Previous
                </button>

                {!isSubmitted ? (
                    currentQuestionIndex === totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
                        >
                            Submit Exam
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
                        >
                            Next <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </button>
                    )
                ) : (
                    <div className="flex gap-4">
                        <Link href="/exam" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                            Back to List
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Retake
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
