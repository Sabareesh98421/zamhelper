
import { createSupabaseServerClient } from "@/lib/supabase/server"; // Correctly import the utility
import { notFound } from "next/navigation";
import ExamClient from "./ExamClient";

// Define the types for our data structure to ensure type safety
type Question = {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
};

type Upload = {
    id: string;
    file_name: string;
    questions: Question[];
};

async function getUploadData(uploadId: string): Promise<Upload | null> {
    // Use the centralized utility to create the Supabase client
    const supabase = await createSupabaseServerClient();

    // Explicitly type the expected shape of the data from Supabase
    const { data } = await supabase
        .from('uploads')
        .select('id, file_name, questions (*)')
        .eq('id', uploadId)
        .single();

    return data as Upload | null;
}

export default async function ReviewPage({ params }: { params: { id: string } }) {
    const upload = await getUploadData(params.id);

    if (!upload || !upload.questions) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto my-12 p-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Exam for: {upload.file_name}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Answer the questions below to the best of your ability.</p>
            </div>

            {/* Render the interactive client component, passing the questions and uploadId as props */}
            <ExamClient questions={upload.questions} uploadId={upload.id} />

        </div>
    );
}
