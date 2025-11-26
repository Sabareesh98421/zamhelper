
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSnackbar } from '@/hooks/useSnackbar';
import { generateQuestions } from './actions';

export default function ParsePdfPage() {
    const [status, setStatus] = useState("Initializing process...");
    const params = useParams();
    const router = useRouter();
    const { addMessage } = useSnackbar();
    const uploadId = params.id as string;

    useEffect(() => {
        if (!uploadId) {
            setStatus("Error: No upload ID found.");
            addMessage("Could not find the upload record.", "error");
            return;
        }

        const processDocument = async () => {
            try {
                setStatus("Analyzing document and generating questions...");
                // Removed the second argument to match the expected type
                addMessage("Starting to process your document.","info");

                const result = await generateQuestions(uploadId);

                if (result.success) {
                    setStatus("Processing complete! Redirecting...");
                    addMessage("Successfully generated questions!", "success");
                    router.push(`/admin/uploads/${uploadId}/review`);
                } else {
                    setStatus(`Error: ${result.message}`);
                    addMessage(result.message || "An unknown error occurred.", "error");
                }
            } catch (error: any) {
                console.error("[Client] Error during PDF processing:", error);
                setStatus("An unexpected error occurred.");
                addMessage(error.message || "Failed to process the document.", "error");
            }
        };

        processDocument();

    }, [uploadId, router, addMessage]);

    return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Processing Document</h1>
            <div className="mt-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{status}</p>
            </div>
            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">Please wait while we analyze the document and generate the exam questions. This may take a moment.</p>
        </div>
    );
}
