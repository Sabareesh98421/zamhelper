
'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminStorage } from "@/app/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

export async function uploadPdf(formData: FormData) {
    if (!adminStorage) {
        const errorMessage = 'Firebase Admin Storage is not initialized.';
        console.error(errorMessage);
        return { success: false, error: errorMessage };
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Authentication failed.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: 'No file provided.' };
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const bucket = adminStorage.bucket();

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const remoteFile = bucket.file(`uploads/${fileName}`);
        await remoteFile.save(buffer, {
            metadata: {
                contentType: file.type,
                metadata: {
                    firebaseStorageDownloadTokens: uuidv4(),
                },
            },
        });

        const { data: pdfData, error: dbError } = await supabase.from('pdf_uploads').insert({
            file_name: fileName,
            storage_path: remoteFile.name,
            status: 'uploaded',
            uploaded_by: user.id
        }).select('id').single();

        if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
        }

        return { success: true, uploadId: pdfData.id, fileName };

    } catch (error: any) {
        console.error('Error uploading file:', error);
        return { success: false, error: error.message };
    }
}
