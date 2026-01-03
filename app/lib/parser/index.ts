import { SupabaseClient } from "@supabase/supabase-js";
import { saveExamQuestions } from "./db";
import { invokeRustParser } from "./rust-wrapper";
import path from "path";
import fs from "fs";
import os from "os";

export async function processAndSaveExam(uploadId: string, fileBuffer: Buffer, supabase: SupabaseClient) {
    console.log(`[Exam Processor] Processing upload ${uploadId} via Rust...`);

    // 1. Create Temp File
    const tempFilePath = path.join(os.tmpdir(), `upload-${uploadId}-${Date.now()}.pdf`);
    await fs.promises.writeFile(tempFilePath, fileBuffer);
    console.log(`[Exam Processor] Written temp file: ${tempFilePath}`);

    try {
        // 2. Invoke Rust Parser
        // This handles Text Extraction (Native or OCR) AND Question Parsing
        const result = await invokeRustParser(tempFilePath);

        // Cleanup
        await fs.promises.unlink(tempFilePath).catch(e => console.error("Failed to delete temp file:", e));

        if (!result.valid) {
            console.error("[Exam Processor] Parsing failed:", result.error);
            await updateUploadStatus(supabase, uploadId, 'failed', result.error);
            return { success: false, error: result.error };
        }

        console.log(`[Exam Processor] Rust found ${result.questions.length} questions.`);

        // 3. Save to DB
        // Map Rust result to DB schema if needed
        const mappedQuestions = result.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correct_answer
        }));

        await saveExamQuestions(supabase, uploadId, mappedQuestions);

        // 4. Update Status
        await updateUploadStatus(supabase, uploadId, 'completed');

        return { success: true, count: mappedQuestions.length };

    } catch (error: any) {
        console.error("[Exam Processor] Processing Error:", error);
        // Cleanup
        await fs.promises.unlink(tempFilePath).catch(() => { });

        await updateUploadStatus(supabase, uploadId, 'failed', `Processing failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function updateUploadStatus(supabase: SupabaseClient, uploadId: string, status: string, errorMessage?: string) {
    const updateData: any = { status };
    // If we had an error_message column, we'd save it. For now just status.
    const { error } = await supabase.from('pdf_uploads').update(updateData).eq('id', uploadId);
    if (error) {
        console.error("[Exam Processor] Failed to update status:", error);
    }
}
