
import React from 'react';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/server';
import { Exam } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

async function getExams(): Promise<Exam[]> {
  const supabase = await createClient();
  const { data: exams, error } = await supabase
    .from('exams')
    .select('id, title');

  if (error) {
    // Log the detailed error for debugging
    console.error('Error fetching exams from Supabase:', error);
    // Throw a more informative error message
    throw new Error(`Failed to fetch exams. Supabase error: ${JSON.stringify(error, null, 2)}`);
  }

  return exams as Exam[];
}

const ExamPage = async () => {
  let exams: Exam[] = [];
  let errorMessage: string | null = null;
  try {
    exams = await getExams();
  } catch (e) {
    // Log the error and prepare a message for the UI
    if (e instanceof Error) {
      errorMessage = e.message;
    } else {
      errorMessage = 'An unknown error occurred.';
    }
    console.error('Error in ExamPage:', e);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Exams</h1>
        <div className="flex gap-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Random PDF
          </button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Random Content
          </button>
        </div>
      </div>
      {errorMessage && (
        <div className="text-center py-16 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> Could not load exams. Please check your connection and environment variables.</span>
          <pre className="text-sm mt-2 whitespace-pre-wrap">{errorMessage}</pre>
        </div>
      )}
      {!errorMessage && exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <Link key={exam.id} href={`/exam/${exam.id}`}>
              <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                {/* This is the corrected line */}
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{exam.title}</h5>
              </div>
            </Link>
          ))}
        </div>
      ) : !errorMessage && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">No exams found. <Link href="/upload" className="text-blue-500 hover:underline">Upload a PDF</Link> to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
