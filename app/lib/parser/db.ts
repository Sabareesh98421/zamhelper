
import { SupabaseClient } from "@supabase/supabase-js";
import { Question } from "./types";

export async function saveExamQuestions(supabase: SupabaseClient, uploadId: string, questions: Question[]): Promise<void> {
    for (const q of questions) {
        // Insert Question
        const { data: questionData, error: qError } = await supabase.from('questions').insert({
            source_pdf_id: uploadId,
            question_text: q.text,
            explanation: "Explanation not available."
        }).select('id').single();

        if (qError) {
            console.error("Error inserting question:", qError);
            continue; // Skip options if question failed
        }

        // Insert Options for this Question
        const optionsToInsert = q.options.map((optText) => {
            // Logic to determine if correct based only on parsing 'A. text' vs 'Answer: A'
            // The parser saves 'A. Option Text' in options array.
            // It saves 'A' in correctAnswer.
            // We need to parse the letter from the option text to match.

            // Simple heuristic: Extract leading letter from option text
            const match = optText.match(/^([A-D]|[a-d]|[1-4])[\.\)]\s*/);
            const optionLetter = match ? match[1].toUpperCase() : '';

            // Or better, just check if the option text *starts with* the correct answer letter (plus separator)
            // But the parser stores correctAnswer as just "A".
            // We can check if `optText` starts with `q.correctAnswer`.

            // Let's refine the parser logic: The parser stores option text like "A. Output".
            // We should check if the option text starts with the correct answer letter.

            const isCorrect = q.correctAnswer && optText.toUpperCase().startsWith(q.correctAnswer + ".") || optText.toUpperCase().startsWith(q.correctAnswer + ")");

            // Strip the prefix "A. " for cleaner storage? 
            // User didn't ask, but it's often cleaner. For now keep as is for safety.

            return {
                question_id: questionData.id,
                option_text: optText,
                is_correct: !!isCorrect
            };
        });

        const { error: oError } = await supabase.from('question_options').insert(optionsToInsert);
        if (oError) {
            console.error("Error inserting options:", oError);
        }
    }
}
