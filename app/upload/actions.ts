'use server'

import { PDFParse } from 'pdf-parse';
import { createClient } from '@/app/lib/supabase/server'; // Correct import
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as yup from 'yup';
import sanitizeHtml from 'sanitize-html';

// Securely initialize Firebase from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once to avoid errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

const fileSchema = yup.object().shape({
  file: yup
    .mixed<File>()
    .required('File is required')
    .test('is-pdf', 'File must be a PDF', (value) => {
        return value instanceof File && value.type === 'application/pdf';
    }),
});

export async function uploadPdf(formData: FormData) {
    const supabase = await createClient(); // Create server client

    try {
        const file = formData.get('file') as File;
        await fileSchema.validate({ file });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
        if (!sanitizedFileName) {
            return { message: 'Invalid file name.' };
        }

        // 1. Upload to Firebase Storage
        const storageRef = ref(storage, `exams/${sanitizedFileName}`);
        await uploadBytes(storageRef, buffer);
        const downloadURL = await getDownloadURL(storageRef);

        // Parse the PDF content
        const data = await new PDFParse({ data: buffer }).getText();
        const sanitizedContent = sanitizeHtml(data.text);

        // 2. Save metadata to Supabase, including the Firebase Storage URL
        const { error: dbError } = await supabase
            .from('pdf_uploads')
            .insert({
                name: sanitizedFileName,
                content: sanitizedContent,
                storage_path: downloadURL, // Store the public URL from Firebase
            });
        
        if (dbError) {
            // If the database insert fails, we should ideally delete the file from storage.
            // This part can be made more robust, but for now, we throw the error.
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
