'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

interface Exam {
  id: string;
  file_name: string;
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
        .select('id, file_name')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching exams:', error);
      } else if (examsData) {
        setExams(examsData);
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
        redirectTo: `${location.origin}/auth/callback`,
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
            {exams.map((exam) => (
              <Link key={exam.id} href={`/exam/${exam.id}`}>
                <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
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
