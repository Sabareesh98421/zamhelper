
import React from 'react';
import PdfList from './PdfList';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Define a type for the file prop for better type safety
interface FileData {
    name: string;
    path: string;
    size?: number;
    createdAt: string;
}

const ManagePdfsPage = async () => {
    let files: FileData[] = [];
    let error: string | null = null;

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/'); // Or a login page
    }

    try {
        const { data: uploads, error: dbError } = await supabase
            .from('pdf_uploads')
            .select('id, file_name, storage_path, uploaded_at')
            .eq('uploaded_by', user.id)
            .order('uploaded_at', { ascending: false });

        if (dbError) {
            console.error("Error fetching files from Database:", dbError);
            error = `Failed to load files: ${dbError.message}`;
        } else if (uploads) {
            files = uploads.map(upload => ({
                name: upload.file_name,
                path: upload.storage_path,
                // size: 0, // Not available in DB yet
                createdAt: upload.uploaded_at,
            }));
        }

    } catch (err: any) {
        console.error("Error fetching files:", err);
        error = `Failed to load files: ${err.message}.`;
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
