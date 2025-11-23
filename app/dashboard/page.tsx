"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Exam } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('exams')
                .select('id, title, created_at');

            if (error) {
                setError(error.message);
            } else if (data) {
                setExams(data);
            }
            setLoading(false);
        };

        fetchExams();
    }, [supabase]);

    const handleStartExam = (examId: number) => {
        router.push(`/exam/${examId}`);
    };

    if (loading) {
        return <div className="text-center p-8">Loading exams...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto my-10 p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Available Exams</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 truncate">{exam.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Created on: {new Date(exam.created_at).toLocaleDateString()}</p>
                            <button 
                                onClick={() => handleStartExam(exam.id)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                            >
                                Start Exam
                            </button>
                        </div>
                    </div>
                ))}
                 {exams.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">No exams available at the moment. Please check back later.</p>
                )}
            </div>
        </div>
    );
}
