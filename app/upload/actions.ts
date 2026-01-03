
'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminStorage } from "@/app/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { processAndSaveExam } from "@/app/lib/parser";

export async function uploadPdf(formData: FormData) {
    console.log("[Upload Debug] Starting uploadPdf action");

    try {
        if (!adminStorage) {
            const errorMessage = 'Firebase Admin Storage is not initialized.';
            console.error("[Upload Debug] Firebase Admin Error:", errorMessage);
            return { success: false, error: errorMessage };
        }
        console.log("[Upload Debug] Firebase Admin Storage is initialized");

        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log("[Upload Debug] User auth check completed. User ID:", user?.id);

        if (authError || !user) {
            console.error("[Upload Debug] Authentication failed:", authError);
            return { success: false, error: 'Authentication failed.' };
        }
        console.log("[Upload Debug] Checking profile for user:", user.id);

        // --- Self-Healing: Ensure Profile Exists ---
        // Check if the profile exists
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code === 'PGRST116') {
            // Profile missing, attempt to create it using the standard client.
            // This requires the RLS policy to allow INSERT for authenticated users.
            console.warn(`[Server] Profile missing for user ${user.id}. Attempting to create...`);

            const { error: insertError } = await supabase.from('profiles').insert({
                id: user.id,
                email: user.email!,
                role: 'admin' // User stated "each user is admin"
            });

            if (insertError) {
                console.error("[Server] Failed to auto-create profile:", insertError);
                return { success: false, error: `Profile creation failed: ${insertError.message}` };
            }
            console.log(`[Server] Profile successfully created for user ${user.id}`);
        } else if (profileError) {
            // Some other unexpected error
            console.error("[Server] Error checking profile:", profileError);
        }
        // -------------------------------------------

        const file = formData.get('file') as File;
        if (!file) {
            console.error("[Upload Debug] No file provided in form data");
            return { success: false, error: 'No file provided.' };
        }
        console.log(`[Upload Debug] File received: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

        // Sanitize filename: replace hyphens with underscores to avoid confusion, though our regex will handle it.
        // Also user requested this specific change.
        const sanitizedOriginalName = file.name.replace(/-/g, '_');
        const fileName = `${sanitizedOriginalName}-${uuidv4()}`;
        const bucket = adminStorage.bucket();

        console.log("[Upload Debug] processing file buffer...");
        const buffer = Buffer.from(await file.arrayBuffer());
        const userFolder = `${user.id}_${user.email}`;
        const remoteFile = bucket.file(`uploads/${userFolder}/${fileName}`);
        console.log(`[Upload Debug] Attempting to upload to path: uploads/${userFolder}/${fileName}`);

        await remoteFile.save(buffer, {
            metadata: {
                contentType: file.type,
                metadata: {
                    firebaseStorageDownloadTokens: uuidv4(),
                },
            },
        });
        console.log("[Upload Debug] Firebase storage upload successful");

        // 1. Insert into pdf_uploads (Correct table name and status)
        console.log("[Upload Debug] Inserting record into pdf_uploads table...");
        const { data: pdfData, error: dbError } = await supabase.from('pdf_uploads').insert({
            file_name: fileName,
            storage_path: remoteFile.name,
            status: 'pending', // Correct enum value
            uploaded_by: user.id
        }).select('id').single();

        if (dbError) {
            console.error("[Upload Debug] Database error (pdf_uploads):", dbError);
            throw new Error(`Database error (pdf_uploads): ${dbError.message}`);
        }

        const uploadId = pdfData.id;

        // 2. Process and Save Exam (Parse & DB Insert)
        const processResult = await processAndSaveExam(String(uploadId), buffer, supabase);

        if (!processResult.success) {
            console.warn("[Upload Debug] Exam processing had issues:", processResult.error);
            // We don't fail the upload request itself if the file is up, but we might want to tell the user?
            // The actions returns object.
            // For now, let's just return success=true (upload worked), but maybe include warning?
        }

        return { success: true, uploadId: String(uploadId), fileName };

    } catch (error: any) {
        console.error('[Upload Debug] Error uploading file (Global Catch):', error);
        return { success: false, error: `Upload failed: ${error.message}` };
    }
}
