'use server';

import { createClient } from '@/lib/supabase/server';
const pdf = require('pdf-parse');
import { z } from 'zod';

const questionSchema = z.object({
  question_text: z.string(),
  explanation: z.string().optional(),
  options: z.array(z.object({
    option_text: z.string(),
    is_correct: z.boolean(),
  })).min(2),
});

export async function parsePdfAction(pdfId: number): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();

  // 1. Get the PDF record from the database
  const { data: pdfRecord, error: pdfError } = await supabase
    .from('pdf_uploads')
    .select('*')
    .eq('id', pdfId)
    .single();

  if (pdfError || !pdfRecord) {
    return { success: false, message: `Error fetching PDF record: ${pdfError?.message}` };
  }

  // 2. Download the PDF file from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('pdf-uploads')
    .download(pdfRecord.storage_path);

  if (downloadError || !fileData) {
    return { success: false, message: `Error downloading PDF from storage: ${downloadError?.message}` };
  }

  // 3. Parse the PDF content
  try {
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const pdfData = await pdf(buffer);

    // 4. Implement your question extraction logic here
    // This is a placeholder for the complex logic of identifying questions, options, and answers.
    // In a real-world scenario, you would use regex or a more advanced NLP model here.
    const extractedQuestions = []; // This should be populated by your parsing logic

    // For demonstration, let's create a dummy question
    const dummyQuestion = {
      question_text: 'What is the capital of France?',
      options: [
        { option_text: 'London', is_correct: false },
        { option_text: 'Paris', is_correct: true },
        { option_text: 'Berlin', is_correct: false },
        { option_text: 'Madrid', is_correct: false },
      ],
    };
    extractedQuestions.push(dummyQuestion);

    // 5. Validate and insert the questions into the database
    for (const q of extractedQuestions) {
      const validation = questionSchema.safeParse(q);
      if (validation.success) {
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            source_pdf_id: pdfId,
            question_text: validation.data.question_text,
            explanation: validation.data.explanation,
          })
          .select('id')
          .single();

        if (questionError) throw new Error(`Error inserting question: ${questionError.message}`);

        const optionsToInsert = validation.data.options.map(opt => ({
          question_id: questionData.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        }));

        const { error: optionsError } = await supabase.from('question_options').insert(optionsToInsert);
        if (optionsError) throw new Error(`Error inserting options: ${optionsError.message}`);

      } else {
        // Log parsing faults to the database
        await supabase.from('parsing_faults').insert({
          pdf_upload_id: pdfId,
          description: 'Zod validation failed',
          raw_text: JSON.stringify(q),
          suggested_fix: validation.error.message,
        });
      }
    }

    // 6. Update the PDF upload status to 'completed'
    await supabase
      .from('pdf_uploads')
      .update({ status: 'completed' })
      .eq('id', pdfId);

    return { success: true, message: 'PDF parsed and questions imported successfully!' };

  } catch (error: any) {
    // Update the PDF upload status to 'failed'
    await supabase
      .from('pdf_uploads')
      .update({ status: 'failed' })
      .eq('id', pdfId);

    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}
