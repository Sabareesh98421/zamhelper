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

        // 2. Extract Text (Standard)
        let text = await extractTextFromPdf(buffer);

        // Smart Parsing: Check if scanned image (Text length threshold)
        const cleanedText = text.replace(/\s/g, '').trim();
        if (cleanedText.length < 50) {
            console.log("[ExamAction] PDF seems to be image-based (text length < 50). Triggering Rust OCR.");

            // Dependencies for File IO
            const os = await import('os');
            const path = await import('path');
            const fs = await import('fs');
            const { performOcr } = await import('@/app/lib/ocr');

            // Save Buffer to Temp File for OCR
            const tempFilePath = path.join(os.tmpdir(), `exam_gen_${Date.now()}.pdf`);
            await fs.promises.writeFile(tempFilePath, buffer);

            try {
                // Call Rust OCR Wrapper
                const ocrText = await performOcr(tempFilePath);

                if (ocrText && ocrText.trim().length > 0) {
                    console.log("[ExamAction] OCR Success. Replacing text.");
                    text = ocrText;
                } else {
                    console.warn("[ExamAction] OCR returned empty text.");
                }
            } catch (ocrError: any) {
                console.error("[ExamAction] OCR Failed:", ocrError);
                // We intentionally don't throw here, just warn, so we return original (empty) text validation error later.
            } finally {
                // Cleanup
                fs.unlink(tempFilePath, (err: any) => {
                    if (err) console.error("[ExamAction] Cleanup failed:", err);
                });
            }
        }

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
