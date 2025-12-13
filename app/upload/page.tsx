
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '@/hooks/useSnackbar';
import { uploadPdf } from './actions';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const { addMessage } = useSnackbar();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            console.log(`[Client] File selected: ${selectedFile.name}, Size: ${selectedFile.size}`);
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("[Client] Upload form submitted.");

        if (!file) {
            console.warn("[Client] No file selected for upload.");
            addMessage("Please select a file first.", "warning");
            return;
        }

        setIsUploading(true);
        console.log("[Client] Uploading started...");
        addMessage("Uploading your document...", "info");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await uploadPdf(formData);

            if (result.success && result.uploadId) {
                console.log(`[Client] Upload successful. Navigating to review page for ID: ${result.uploadId}`);
                addMessage("Exam created successfully!", "success");
                router.push(`/admin/uploads/${result.uploadId}/review`);
            } else {
                console.error("[Client] Upload failed:", result.error);
                addMessage(result.error || "Upload failed. Please try again.", "error");
            }
        } catch (error: any) {
            console.error("[Client] An unexpected error occurred during upload:", error);
            addMessage("An unexpected error occurred.", "error");
        } finally {
            setIsUploading(false);
            console.log("[Client] Uploading finished.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Upload Your Document</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Upload a PDF to automatically generate an exam.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ArrowUpTrayIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 800x400px)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                    </label>
                </div>

                {file && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Selected file: <span className="font-medium">{file.name}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isUploading || !file}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
                >
                    {isUploading ? 'Uploading...' : 'Upload & Generate Exam'}
                </button>
            </form>
        </div>
    );
}
