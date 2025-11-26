
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSnackbar } from '@/hooks/useSnackbar';
import { parsePdfAction } from './actions';

export default function ParsePdfPage() {
    const [status, setStatus] = useState("Starting parsing process...");
    const params = useParams();
    const router = useRouter();
    const { addMessage } = useSnackbar();
    const pdfId = Number(params.id);

    useEffect(() => {
        if (!pdfId) {
            addMessage("Invalid PDF ID.", "error");
            return;
        }

        const processParsing = async () => {
            setStatus(`Processing PDF ID: ${pdfId}... This may take a moment.`);
            try {
                const result = await parsePdfAction(pdfId);
                if (result.success) {
                    addMessage(result.message, "success");
                    setStatus(result.message);
                    setTimeout(() => router.push('/dashboard'), 3000);
                } else {
                    addMessage(result.message, "error");
                    setStatus("Parsing failed.");
                }
            } catch (err: any) {
                addMessage(err.message || "An unknown error occurred.", "error");
                setStatus("An unexpected error occurred.");
            }
        };

        processParsing();

    }, [pdfId, router, addMessage]);

    return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Processing Document</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Please wait while we analyze and extract questions from your PDF.</p>
            </div>

            <div className="mt-8">
                <div className="relative pt-1">
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-900">
                        <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 animate-pulse"></div>
                    </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Status:</p>
                    <p className={`text-xl font-semibold mt-1 text-green-500'`}>
                        {status}
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center">
                 <button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}
