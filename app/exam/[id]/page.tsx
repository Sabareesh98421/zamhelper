
import React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createExamFromPdf } from '@/app/exam/actions';
import ExamTaker from './ExamTaker';
import Link from 'next/link';

// Helper to get PDF path from DB if not in query params (robustness)
async function getPdfPath(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('pdf_uploads')
    .select('storage_path, file_name')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function ExamIdPage({ params, searchParams }: { params: { id: string }, searchParams: { path?: string } }) {
  const { id } = await params;
  const { path } = await searchParams; // Next.js 15+ searchParams is async? Only params. Wait, check Next 16. In 15+ both are promises.
  // In strict Next 15+, await params. In 14 no. User said Next 16.0.10.
  // I will await them to be safe.

  let storagePath = path;
  let fileName = "Exam";

  if (!storagePath) {
    const fileData = await getPdfPath(id);
    if (fileData) {
      storagePath = fileData.storage_path;
      fileName = fileData.file_name;
    }
  } else {
    // Fetch filename mostly for display? Or trust it provided.
    // We can just use "Exam" or fetch DB anyway if we want title.
    const fileData = await getPdfPath(id);
    if (fileData) fileName = fileData.file_name;
  }

  if (!storagePath) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-gray-600">Could not find the associated PDF file.</p>
        <Link href="/exam" className="mt-4 inline-block text-indigo-600 underline">Back to Exams</Link>
      </div>
    );
  }

  // Call Server Action to parse PDF
  const result = await createExamFromPdf(storagePath);

  if (!result.success || !result.questions) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-red-600">Parsing Failed</h1>
        <p className="mt-2 text-gray-600">{result.error}</p>
        <div className="mt-4 p-4 bg-yellow-50 text-left text-sm text-yellow-800 rounded mx-auto max-w-lg">
          <strong>Tip:</strong> Ensure your PDF has selectable text (not scanned images) and follows a format like:
          <pre className="mt-2 bg-white p-2 border rounded">
            1. Question Text...
            A. Option 1
            B. Option 2
            Answer: B
          </pre>
        </div>
        <Link href="/exam" className="mt-4 inline-block text-indigo-600 underline">Back to Exams</Link>
      </div>
    );
  }

  return (
    <div>
      <ExamTaker questions={result.questions} examTitle={fileName} />
    </div>
  );
}
