'use server';
import { adminStorage } from '@/app/lib/firebase-admin';
import { invokeRustParser } from '@/app/lib/parser/rust-wrapper';
import { Question } from '@/app/lib/parser/types';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export async function createExamFromPdf(storagePath: string): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
    if (!adminStorage) {
        return { success: false, error: "Server configuration error: Storage not initialized." };
    }

    try {
        // 1. Fetch PDF from Firebase Storage
        const bucket = adminStorage.bucket();
        const file = bucket.file(storagePath);

        // Check if exists
        const [exists] = await file.exists();
        if (!exists) {
            return { success: false, error: "File not found in storage." };
        }

        // Download to buffer
        const [buffer] = await file.download();

        // 2. Save Buffer to Temp File for Rust Parser
        const tempFilePath = path.join(os.tmpdir(), `exam_gen_${Date.now()}.pdf`);
        await fs.promises.writeFile(tempFilePath, buffer);

        try {
            // 3. Call Rust Parser (Logic: Text/OCR + Question Parsing is all handled inside)
            const result = await invokeRustParser(tempFilePath);

            if (!result.valid) {
                return { success: false, error: result.error || "Failed to parse questions." };
            }

            return { success: true, questions: result.questions };
        } finally {
            // Cleanup
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error("[ExamAction] Cleanup failed:", err);
            });
        }

    } catch (error: any) {
        console.error("Create Exam Error:", error);
        return { success: false, error: error.message };
    }
}
