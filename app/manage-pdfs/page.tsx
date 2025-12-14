
import React from 'react';
import { adminStorage } from '@/app/lib/firebase-admin';
import PdfList from './PdfList'; // Import the new client component

export const dynamic = 'force-dynamic';

// Define a type for the file prop for better type safety
interface FileData {
    name: string;
    size: number;
    createdAt: string;
}

// This is now a React Server Component by default
const ManagePdfsPage = async () => {
    let files: FileData[] = [];
    let error: string | null = null;

    try {
        // This code now only runs on the server
        if (!adminStorage) {
            throw new Error('Firebase Admin Storage is not initialized. Check your server configuration.');
        }

        const bucket = adminStorage.bucket();
        if (!bucket) {
            throw new Error('Firebase Storage bucket is not available. Check your storageBucket setting in firebase-admin.ts.');
        }
        const [allFiles] = await bucket.getFiles();
        files = allFiles.map(file => ({
            name: file.name,
            size: file.metadata.size ? parseInt(file.metadata.size as string, 10) : 0,
            createdAt: file.metadata.timeCreated || new Date().toISOString(), // Fallback to current date
        }));

    } catch (err: any) {
        console.error("Error fetching files from Firebase Storage:", err);
        error = `Failed to load files: ${err.message}. Ensure the FIREBASE_SERVICE_ACCOUNT_JSON is set correctly in your environment variables.`;
    }

    // The UI is rendered here, passing server-fetched data to the client component
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Uploaded PDFs</h1>
            <PdfList files={files} error={error} />
        </div>
    );
}

export default ManagePdfsPage;
