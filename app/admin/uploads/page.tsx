"use client";

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function PdfUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        setUploading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to upload files.");
            setUploading(false);
            return;
        }

        // The file name will be prefixed with the user's id to ensure uniqueness
        const fileName = `${user.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
            .from('pdf-uploads')
            .upload(fileName, file);

        if (uploadError) {
            setError(uploadError.message);
            setUploading(false);
            return;
        }

        const { data, error: dbError } = await supabase
            .from('pdf_uploads')
            .insert([{ file_name: file.name, storage_path: fileName, uploaded_by: user.id }])
            .select();

        if (dbError) {
            setError(dbError.message);
        } else if (data) {
            // On success, redirect to a page that will trigger the parsing
            router.push(`/admin/uploads/${data[0].id}/parse`);
        }

        setUploading(false);
    };

    return (
        <div className="max-w-xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Upload PDF Question Paper</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="pdf-upload" className="block text-gray-700 text-sm font-bold mb-2">PDF File:</label>
                    <input 
                        id="pdf-upload" 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileChange} 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    />
                </div>
                
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

                <button 
                    type="submit" 
                    disabled={uploading || !file}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                >
                    {uploading ? 'Uploading...' : 'Upload and Process'}
                </button>
            </form>
        </div>
    );
}
