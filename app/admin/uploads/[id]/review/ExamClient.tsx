
"use client";

import { useState } from 'react';

// Define types for better readability and maintenance
type QuestionOption = {
    id: number;
    option_text: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    question_text: string;
    question_options: QuestionOption[];
};

type ExamClientProps = {
    questions: Question[];
    uploadId: string; // Keep track of the upload this exam is for
};

export default function ExamClient({ questions, uploadId }: ExamClientProps) {
    // Map question ID to selected Option ID
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswerChange = (questionId: number, optionId: number) => {
        if (submitted) return; // Don't allow changes after submission

        setUserAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleSubmit = () => {
        // Calculate score
        let correctCount = 0;
        questions.forEach((q) => {
            const selectedOptionId = userAnswers[q.id];
            const correctOption = q.question_options.find(opt => opt.is_correct);

            if (correctOption && selectedOptionId === correctOption.id) {
                correctCount++;
            }
        });

        setScore(correctCount);
        setSubmitted(true);
    };

    // Helper to determine styling based on the answer's state
    const getAnswerClassName = (questionId: number, option: QuestionOption) => {
        const isSelected = userAnswers[questionId] === option.id;

        if (!submitted) {
            // Before submission, just highlight the selected answer
            return isSelected
                ? 'bg-indigo-200 dark:bg-indigo-900'
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600';
        }

        // After submission, show correct/incorrect answers
        if (option.is_correct) {
            return 'bg-green-200 dark:bg-green-800'; // Correct answer
        }
        if (isSelected && !option.is_correct) {
            return 'bg-red-200 dark:bg-red-800'; // User's incorrect choice
        }
        return 'bg-gray-50 dark:bg-gray-700'; // Default, unselected answer
    };

    return (
        <div className="space-y-8">
            {submitted && (
                <div className="p-6 bg-blue-100 dark:bg-blue-900 rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200">Exam Complete!</h2>
                    <p className="mt-2 text-xl text-gray-800 dark:text-gray-200">Your Score: <span className="font-extrabold">{score}</span> out of {questions.length}</p>
                </div>
            )}

            {questions.map((q, index) => (
                <div key={q.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{index + 1}. {q.question_text}</p>
                    <div className="mt-4 space-y-3">
                        {q.question_options.map((option) => (
                            <button
                                key={option.id}
                                disabled={submitted}
                                onClick={() => handleAnswerChange(q.id, option.id)}
                                className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${getAnswerClassName(q.id, option)}`}>
                                <span className="text-gray-800 dark:text-gray-200">{option.option_text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {!submitted && (
                <div className="text-center mt-10">
                    <button
                        onClick={handleSubmit}
                        className="py-3 px-8 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                        disabled={Object.keys(userAnswers).length !== questions.length} // Disable if not all questions are answered
                    >
                        Submit Exam
                    </button>
                </div>
            )}
        </div>
    );
}
