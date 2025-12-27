import React from 'react';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import PdfList from '@/app/components/PdfList';

export const dynamic = 'force-dynamic';

async function getPdfExams() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('[ExamPage] No user found.');
    return [];
  }

  console.log('[ExamPage] Fetching exams for user:', user.id);

  const { data, error } = await supabase
    .from('pdf_uploads')
    .select('id, file_name, storage_path, created_at')
    .eq('uploaded_by', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ExamPage] Error fetching PDF exams:', error);
    return [];
  }

  // Map to PdfFile interface
  const formattedData = data?.map(item => ({
    ...item,
    path: item.storage_path, // Map storage_path to path
    uploaded_at: item.created_at // Map created_at to uploaded_at for the component
  })) || [];

  console.log('[ExamPage] Fetched exams:', formattedData.length);
  return formattedData;
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

      <PdfList files={exams} />
    </div>
  );
};

export default ExamPage;
