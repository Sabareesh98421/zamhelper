'use server';



import { adminStorage } from '@/app/lib/firebase-admin';
import { extractTextFromPdf, parseQuestionsFromText, Question } from '@/app/lib/parsing';

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

        // 2. Extract Text
        const text = await extractTextFromPdf(buffer);

        // 3. Parse Questions using Algorithm
        const result = parseQuestionsFromText(text);

        if (!result.valid) {
            return { success: false, error: result.error || "Failed to parse questions." };
        }

        return { success: true, questions: result.questions };

    } catch (error: any) {
        console.error("Create Exam Error:", error);
        return { success: false, error: error.message };
    }
}
