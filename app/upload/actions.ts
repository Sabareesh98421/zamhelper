
'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminStorage } from "@/app/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

export async function uploadPdf(formData: FormData) {
    console.log("[Upload Debug] Starting uploadPdf action");
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
    // Check if the profile exists to avoid foreign key constraint violation
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    if (profileError && profileError.code === 'PGRST116') {
        // Profile missing (PGRST116 is "Row not found"), let's create it
        console.warn(`[Server] Profile missing for user ${user.id}. creating it now...`);
        const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email!,
            role: 'student' // Default role
        });

        if (insertError) {
            console.error("[Server] Failed to auto-create profile:", insertError);
            return { success: false, error: `Profile creation failed: ${insertError.message}` };
        }
        console.log(`[Server] Profile successfully created for user ${user.id}`);
    } else if (profileError) {
        // Some other unexpected error
        console.error("[Server] Error checking profile:", profileError);
        // We continue, hoping it might just be a permissions issue that doesn't block the FK (unlikely but safe fallback)
    }
    // -------------------------------------------

    const file = formData.get('file') as File;
    if (!file) {
        console.error("[Upload Debug] No file provided in form data");
        return { success: false, error: 'No file provided.' };
    }
    console.log(`[Upload Debug] File received: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    const fileName = `${uuidv4()}-${file.name}`;
    const bucket = adminStorage.bucket();

    try {
        console.log("[Upload Debug] processing file buffer...");
        const buffer = Buffer.from(await file.arrayBuffer());
        const remoteFile = bucket.file(`uploads/${fileName}`);
        console.log(`[Upload Debug] Attempting to upload to path: uploads/${fileName}`);

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

        // 2. Generate Mock Questions
        const mockQuestions = [
            {
                text: "What is the primary capital of the implementation?",
                options: [
                    { text: "London", isCorrect: false },
                    { text: "Paris", isCorrect: true },
                    { text: "Berlin", isCorrect: false },
                    { text: "Madrid", isCorrect: false }
                ]
            },
            {
                text: "Which protocol is used for secure web communication?",
                options: [
                    { text: "FTP", isCorrect: false },
                    { text: "HTTP", isCorrect: false },
                    { text: "HTTPS", isCorrect: true },
                    { text: "SMTP", isCorrect: false }
                ]
            },
            {
                text: "What is the result of 2 + 2?",
                options: [
                    { text: "3", isCorrect: false },
                    { text: "4", isCorrect: true },
                    { text: "5", isCorrect: false },
                    { text: "22", isCorrect: false }
                ]
            }
        ];

        // 3. Insert Questions and Options
        for (const q of mockQuestions) {
            // Insert Question
            const { data: questionData, error: qError } = await supabase.from('questions').insert({
                source_pdf_id: uploadId,
                question_text: q.text,
                explanation: "This is a mock explanation."
            }).select('id').single();

            if (qError) {
                console.error("Error inserting question:", qError);
                continue; // Skip options if question failed
            }

            // Insert Options for this Question
            const optionsToInsert = q.options.map(opt => ({
                question_id: questionData.id,
                option_text: opt.text,
                is_correct: opt.isCorrect
            }));

            const { error: oError } = await supabase.from('question_options').insert(optionsToInsert);
            if (oError) {
                console.error("Error inserting options:", oError);
            }
        }

        return { success: true, uploadId: uploadId, fileName };

    } catch (error: any) {
        console.error('[Upload Debug] Error uploading file:', error);
        return { success: false, error: error.message };
    }
}
