"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPastAttemptsAction } from './actions';
import type { Attempt, Exam } from '@/lib/types';

interface AttemptWithExam extends Attempt {
    exams: Pick<Exam, 'title'>;
}

export default function PracticeDashboardPage() {
    const [attempts, setAttempts] = useState<AttemptWithExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchAttempts = async () => {
            setLoading(true);
            const result = await getPastAttemptsAction();
            if (result.success && result.attempts) {
                setAttempts(result.attempts as any);
            } else {
                setError(result.message || "Failed to load past attempts.");
            }
            setLoading(false);
        };

        fetchAttempts();
    }, []);

    if (loading) return <div className="text-center p-10">Loading practice history...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="max-w-5xl mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Practice & Review</h1>

            {attempts.length === 0 ? (
                <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No Completed Exams Yet!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Complete an exam from the dashboard to start practicing.</p>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="mt-6 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {attempts.map(attempt => (
                        <div key={attempt.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{attempt.exams.title}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Completed on: {new Date(attempt.end_time!).toLocaleDateString()} | Score: <span className="font-bold">{attempt.score?.toFixed(2)}%</span>
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0 flex space-x-3 shrink-0">
                                <button 
                                    onClick={() => router.push(`/exam/${attempt.exam_id}/results?attemptId=${attempt.id}`)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    Review Answers
                                </button>
                                <button 
                                    onClick={() => router.push(`/practice/session?attemptId=${attempt.id}`)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                                >
                                    Practice Incorrect
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
