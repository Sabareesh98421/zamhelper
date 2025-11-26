
'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

interface Exam {
  id: string;
  file_name: string; // Corrected from 'name' to 'file_name'
}

export default function Home() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    const fetchExams = async () => {
      // Select 'file_name' to match the database schema
      const { data: examsData, error } = await supabase
        .from('pdf_uploads')
        .select('id, file_name') // Corrected column name
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exams:', error);
      } else if (examsData) {
        setExams(examsData);
      }
    };
    fetchExams();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to ZamHelper</h1>
        <p className="text-xl mb-8">Your ultimate tool for creating and taking exams from your question papers.</p>
        <Link href="/upload" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg">
          Get Started
        </Link>
      </div>
      <div className="py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Recently Uploaded Exams</h2>
        {exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <Link key={exam.id} href={`/exam/${exam.id}`}>
                <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                  {/* Display file_name */}
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{exam.file_name}</h5>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No exams have been uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
