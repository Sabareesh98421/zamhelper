'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PdfFile {
    id: string;
    file_name: string;
    path: string; // Renamed from storage_path
    uploaded_at: string;
}

interface PdfListProps {
    files: PdfFile[];
}

export default function PdfList({ files }: PdfListProps) {
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const router = useRouter();

    const handleStartExam = () => {
        if (selectedExamId) {
            const file = files.find(f => f.id === selectedExamId);
            if (file) {
                router.push(`/exam/${file.id}?path=${encodeURIComponent(file.path)}`);
            }
        }
    };

    if (!files || files.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No exams available</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload a PDF to generate an exam.</p>
                <div className="mt-6">
                    <button
                        onClick={() => router.push('/upload')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Upload PDF
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => {
                    const isSelected = selectedExamId === file.id;
                    return (
                        <div
                            key={file.id}
                            onClick={() => setSelectedExamId(file.id)}
                            className={`block p-6 border rounded-xl shadow-sm cursor-pointer transition-all duration-200 
                                ${isSelected
                                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-400'
                                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md dark:bg-gray-800 dark:border-gray-700'
                                }`}
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className={`flex-shrink-0 p-3 rounded-full ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'}`}>
                                    {isSelected ? <CheckCircleIcon className="h-8 w-8" /> : <DocumentTextIcon className="h-8 w-8" />}
                                </div>
                                <div className="overflow-hidden">
                                    <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate" title={file.file_name}>
                                        {file.file_name}
                                    </h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(file.uploaded_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-auto flex justify-between items-center">
                                <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {isSelected ? 'Selected' : 'Click to select'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center border-t pt-6 dark:border-gray-700">
                <button
                    onClick={handleStartExam}
                    disabled={!selectedExamId}
                    className="w-full md:w-auto px-8 py-3 text-lg font-bold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                    {selectedExamId ? 'Start Selected Exam' : 'Select an Exam to Start'}
                </button>
            </div>
        </div>
    );
}
