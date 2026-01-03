'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

interface Exam {
  id: string;
  file_name: string;
  status: string;
}

export default function Home() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndExams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: examsData, error } = await supabase
        .from('pdf_uploads')
        .select('id, file_name, status')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exams:', error);
      } else if (examsData) {
        setExams(examsData as any);
      }
      setLoading(false);
    };

    fetchUserAndExams();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to ZamHelper</h1>
        <p className="text-xl mb-8">Your ultimate tool for creating and taking exams from your question papers.</p>
        {!loading && (
          user ? (
            <Link href="/upload" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg">
              Get Started
            </Link>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg"
            >
              Login with Google
            </button>
          )
        )}
      </div>
      <div className="py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Recently Uploaded Exams</h2>
        {exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam: any) => (
              <Link key={exam.id} href={exam.status === 'failed' ? '#' : `/exam/${exam.id}`} onClick={e => exam.status === 'failed' && e.preventDefault()}>
                <div className={`block p-6 bg-white border rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors ${exam.status === 'failed' ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate pr-2">{exam.file_name}</h5>
                    {exam.status === 'failed' && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Failed</span>
                    )}
                    {exam.status === 'pending' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">Processing</span>
                    )}
                  </div>
                  {exam.status === 'failed' ? (
                    <p className="text-sm text-red-600 dark:text-red-400">Processing failed. Likely image-based PDF.</p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ready to take exam.</p>
                  )}
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
