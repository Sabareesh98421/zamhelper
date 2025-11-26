
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminStorage } from "@/app/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

export async function uploadPdf(formData: FormData) {
    console.log("[Server Action: uploadPdf] Received request for sanitization and storage.");
    
    // The adminStorage object from firebase-admin is already the bucket
    if (!adminStorage) {
        console.error("[Server Action: uploadPdf] Firebase Admin SDK not initialized. Storage is unavailable.");
        return { success: false, message: "Storage service is not configured. Please contact support." };
    }

    const supabase = await createSupabaseServerClient();

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
        console.error("[Server Action: uploadPdf] No user session found.");
        return { success: false, message: "Not authorized" };
    }

    const file = formData.get("file") as File;

    if (!file || typeof file.arrayBuffer !== 'function' || file.type !== 'application/pdf') {
        return { success: false, message: "Invalid file. Please upload a PDF." };
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const storagePath = `uploads/${user.id}/${fileName}`;

    try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        
        // adminStorage is the bucket, so we can call .file() directly
        await adminStorage.file(storagePath).save(fileBuffer, {
            metadata: { contentType: file.type },
        });

        const { data: uploadData, error: uploadError } = await supabase
            .from("uploads")
            .insert({ 
                file_name: file.name, 
                storage_path: storagePath, 
                status: "uploaded",
                user_id: user.id 
            })
            .select("id")
            .single();

        if (uploadError) {
            console.error("[Server Action] Supabase insert error:", uploadError);
            // If DB insert fails, delete the file from storage to prevent orphans
            await adminStorage.file(storagePath).delete();
            return { success: false, message: "Could not save file metadata." };
        }

        console.log(`[Server Action: uploadPdf] File sanitized and stored. Upload ID: ${uploadData.id}`);
        return { success: true, uploadId: uploadData.id };

    } catch (err: any) {
        console.error("[Server Action] An unexpected error occurred during upload:", err);
        return {
            success: false,
            message: `Failed to upload: ${err.message || "An unknown error occurred."}`,
        };
    }
}
