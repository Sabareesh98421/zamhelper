'use server'

import { createClient } from '@/app/lib/supabase/server';
import * as yup from 'yup';
import { adminStorage } from '@/app/lib/firebase/admin';

const fileSchema = yup.object().shape({
  file: yup
    .mixed<File>()
    .required('File is required')
    .test('is-pdf', 'File must be a PDF', (value) => {
        return value instanceof File && value.type === 'application/pdf';
    }),
});

export async function uploadPdf(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'You must be logged in to upload a file.' };
    }

    try {
        const file = formData.get('file') as File;
        await fileSchema.validate({ file });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const sanitizedFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

        // 1. Upload to Firebase Storage
        const bucket = adminStorage.bucket();
        const fileUpload = bucket.file(`exams/${sanitizedFileName}`);
        
        await fileUpload.save(buffer, {
            metadata: {
                contentType: file.type,
            },
        });

        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

        // 2. Save metadata to Supabase
        const { data, error: dbError } = await supabase
            .from('pdf_uploads')
            .insert({
                file_name: sanitizedFileName,
                storage_path: downloadURL,
                uploaded_by: user.id,
                status: 'pending'
            })
            .select('id')
            .single();
        
        if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
        }

        if (!data || !data.id) {
            throw new Error('Failed to get upload ID after insert.');
        }

        return { success: true, message: 'PDF uploaded successfully!', uploadId: data.id };

    } catch (error) {
        let errorMessage;
        if (error instanceof yup.ValidationError) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = 'An unknown error occurred.';
        }
        
        console.error('Error uploading PDF:', error);
        return { success: false, message: errorMessage };
    }
}
