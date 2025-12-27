'use server';

import { adminStorage } from '@/app/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deletePdf(fileName: string, storagePath: string) {
    // 1. Authenticate User
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Authentication failed.' };
    }

    // 2. Delete from Firebase Storage
    if (!adminStorage) {
        const errorMessage = 'Firebase Admin Storage is not initialized.';
        console.error(errorMessage);
        return { success: false, error: errorMessage };
    }
    const bucket = adminStorage.bucket();
    // storagePath is expected to be the full path e.g. "uploads/user_id/file.pdf"
    const file = bucket.file(storagePath);

    try {
        const [exists] = await file.exists();
        if (exists) {
            await file.delete();
            console.log(`[Server] Deleted file from storage: ${storagePath}`);
        } else {
            console.warn(`[Server] File not found in storage: ${storagePath}. Proceeding to DB deletion.`);
        }
    } catch (error: any) {
        console.error('Error deleting file from storage:', error);
        // Continue to try deleting from DB even if storage fails (optional, depending on strictness)
        // For now, return error if storage fails significantly, but "not found" is handled above.
        return { success: false, error: `Storage deletion failed: ${error.message}` };
    }

    // 3. Delete from Database (pdf_uploads)
    try {
        const { error: dbError } = await supabase
            .from('pdf_uploads')
            .delete()
            .eq('file_name', fileName)
            .eq('uploaded_by', user.id);

        if (dbError) {
            console.error('[Server] Error deleting from DB:', dbError);
            return { success: false, error: `Database deletion failed: ${dbError.message}` };
        }

        console.log(`[Server] Deleted record from DB: ${fileName}`);
        revalidatePath('/manage-pdfs');
        return { success: true };

    } catch (error: any) {
        console.error('[Server] Unexpected error during DB deletion:', error);
        return { success: false, error: error.message };
    }
}

export async function getDownloadUrl(fullPath: string): Promise<string> {
    if (!adminStorage) {
        throw new Error('Firebase Admin Storage is not initialized.');
    }
    const bucket = adminStorage.bucket();
    const file = bucket.file(fullPath);
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // A long time in the future.
    });
    return url;
}
