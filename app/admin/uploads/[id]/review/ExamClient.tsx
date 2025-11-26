
"use client";

import { useState } from 'react';

// Define types for better readability and maintenance
type Question = {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number; // Index of the correct answer
};

type ExamClientProps = {
    questions: Question[];
    uploadId: string; // Keep track of the upload this exam is for
};

export default function ExamClient({ questions, uploadId }: ExamClientProps) {
    const [userAnswers, setUserAnswers] = useState<number[]>(Array(questions.length).fill(-1));
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
        if (submitted) return; // Don't allow changes after submission

        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = answerIndex;
        setUserAnswers(newAnswers);
    };

    const handleSubmit = () => {
        // Calculate score
        let correctCount = 0;
        questions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                correctCount++;
            }
        });

        setScore(correctCount);
        setSubmitted(true);
    };

    // Helper to determine styling based on the answer's state
    const getAnswerClassName = (questionIndex: number, answerIndex: number) => {
        if (!submitted) {
            // Before submission, just highlight the selected answer
            return userAnswers[questionIndex] === answerIndex 
                ? 'bg-indigo-200 dark:bg-indigo-900' 
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600';
        }

        // After submission, show correct/incorrect answers
        const isCorrect = questions[questionIndex].correctAnswer === answerIndex;
        const isSelected = userAnswers[questionIndex] === answerIndex;

        if (isCorrect) {
            return 'bg-green-200 dark:bg-green-800'; // Correct answer
        }
        if (isSelected && !isCorrect) {
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
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{index + 1}. {q.question}</p>
                    <div className="mt-4 space-y-3">
                        {q.answers.map((answer, ansIndex) => (
                            <button
                                key={ansIndex}
                                disabled={submitted}
                                onClick={() => handleAnswerChange(index, ansIndex)}
                                className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${getAnswerClassName(index, ansIndex)}`}>
                                <span className="text-gray-800 dark:text-gray-200">{answer}</span>
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
                        disabled={userAnswers.includes(-1)} // Disable if not all questions are answered
                        >
                        Submit Exam
                    </button>
                </div>
            )}
        </div>
    );
}
