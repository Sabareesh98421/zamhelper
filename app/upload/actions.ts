'use server'

import { PDFParse } from 'pdf-parse';
import { createClient } from '@/app/lib/supabase/server';
import * as yup from 'yup';
import sanitizeHtml from 'sanitize-html';
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

    try {
        const file = formData.get('file') as File;
        await fileSchema.validate({ file });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
        if (!sanitizedFileName) {
            return { message: 'Invalid file name.' };
        }

        // 1. Upload to Firebase Storage using the Admin SDK
        const bucket = adminStorage.bucket();
        const fileUpload = bucket.file(`exams/${sanitizedFileName}`);
        
        await fileUpload.save(buffer, {
            metadata: {
                contentType: file.type,
            },
        });

        // The public URL can be constructed directly
        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

        // Parse the PDF content
        const data = await new PDFParse({ data: buffer }).getText();
        const sanitizedContent = sanitizeHtml(data.text);

        // 2. Save metadata to Supabase
        const { error: dbError } = await supabase
            .from('pdf_uploads')
            .insert({
                file_name: sanitizedFileName,
                content: sanitizedContent,
                storage_path: downloadURL,
            });
        
        if (dbError) {
            throw dbError;
        }

        return { message: 'PDF uploaded and parsed successfully!' };
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return { message: error.message };
        }
        console.error('Error uploading PDF:', error);
        const errorMessage = (error as Error).message || 'An unknown error occurred.';
        return { message: `An unexpected error occurred: ${errorMessage}` };
    }
}
