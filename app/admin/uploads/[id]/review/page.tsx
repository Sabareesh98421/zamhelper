
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ExamClient from "./ExamClient";

// Define the types matching the DB structure
type QuestionOption = {
    id: number;
    option_text: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    question_text: string;
    question_options: QuestionOption[];
};

type Upload = {
    id: string; // The schema says pdf_uploads.id is integer, but let's check if the generic 'Upload' type was assuming string before. Schema says integer. The params.id is string from URL.
    file_name: string;
    questions: Question[];
};

async function getUploadData(uploadId: string): Promise<Upload | null> {
    const supabase = await createSupabaseServerClient();

    const { data } = await supabase
        .from('pdf_uploads') // Correct Table
        .select(`
            id, 
            file_name, 
            questions (
                id,
                question_text,
                question_options (
                    id,
                    option_text,
                    is_correct
                )
            )
        `)
        .eq('id', uploadId)
        .single();

    return data as any; // Cast to any because Supabase types might be strict/auto-generated and disjoint from our manual types here
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
    // Next.js 15 params are promises
    const { id } = await params;

    // Ensure ID is valid integer before querying if schema demands it, or just pass it if supabase handles casting string->int
    const upload = await getUploadData(id);

    if (!upload || !upload.questions) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto my-12 p-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Exam for: {upload.file_name}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Answer the questions below to the best of your ability.</p>
            </div>

            <ExamClient questions={upload.questions} uploadId={upload.id.toString()} />

        </div>
    );
}
