
'use server'

import { PDFParse } from 'pdf-parse';
import { db, storage } from '@/app/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import * as yup from 'yup';
import sanitizeHtml from 'sanitize-html';

const fileSchema = yup.object().shape({
  file: yup
    .mixed()
    .required('File is required')
    .test('is-pdf', 'File must be a PDF', (value) => {
        if (value instanceof File) {
            return value.type === 'application/pdf';
        }
        return false;
    }),
});

export async function uploadPdf(formData: FormData) {
    try {
        const file = formData.get('file') as File;

        await fileSchema.validate({ file });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize the file name to prevent path traversal and other attacks
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
        if (!sanitizedFileName) {
            return { message: 'Invalid file name.' };
        }

        let storagePath;
        try {
            // Upload the PDF to Firebase Storage
            const storageRef = ref(storage, `exams/${sanitizedFileName}`);
            const uploadResult = await uploadBytes(storageRef, buffer);
            storagePath = uploadResult.ref.fullPath;
        } catch (storageError) {
            console.error('Error uploading to Firebase Storage:', storageError);
            const errorMessage = (storageError as Error).message || 'An unknown storage error occurred.';
            return { message: `Storage Error: ${errorMessage}` };
        }


        // Parse the PDF content
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();

        // Sanitize the parsed content to prevent XSS
        const sanitizedContent = sanitizeHtml(data.text);

        try {
            // Save the parsed and sanitized content to Firestore
            await addDoc(collection(db, 'exams'), {
                name: sanitizedFileName,
                content: sanitizedContent,
                storagePath: storagePath,
                createdAt: new Date(),
            });
        } catch (firestoreError) {
             console.error('Error saving to Firestore:', firestoreError);
             const errorMessage = (firestoreError as Error).message || 'An unknown database error occurred.';
            return { message: `Firestore Error: ${errorMessage}` };
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
