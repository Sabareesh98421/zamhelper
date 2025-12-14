import React from 'react';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DocumentTextIcon } from '@heroicons/react/24/outline'; // Assuming you have heroicons

export const dynamic = 'force-dynamic';

async function getPdfExams() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Fetch only processed files (assuming processed means uploaded?)
  // Actually, we can fetch all.
  const { data, error } = await supabase
    .from('pdf_uploads')
    .select('id, file_name, storage_path, uploaded_at')
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching PDF exams:', error);
    return [];
  }

  return data;
}

const ExamPage = async () => {
  const exams = await getPdfExams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Available Exams</h1>
        <Link href="/upload" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors">
          Upload New PDF
        </Link>
      </div>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam: any) => (
            <Link key={exam.id} href={`/exam/${exam.id}?path=${encodeURIComponent(exam.storage_path)}`}>
              <div className="block p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                    <DocumentTextIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h5 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate" title={exam.file_name}>
                      {exam.file_name}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(exam.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full dark:bg-indigo-900 dark:text-indigo-200">
                    Start Exam &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No exams available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload a PDF to generate an exam.</p>
          <div className="mt-6">
            <Link href="/upload" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Upload PDF
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
