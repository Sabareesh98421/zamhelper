import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Placeholder data for practice exams
const practiceExams = [
  {
    id: 'algebra-1',
    title: 'Algebra 1',
    description: 'Master the fundamentals of algebraic expressions, equations, and functions.',
    category: 'Mathematics',
  },
  {
    id: 'us-history',
    title: 'US History',
    description: 'Explore the major events and figures that shaped the United States.',
    category: 'History',
  },
  {
    id: 'biology-101',
    title: 'Biology 101',
    description: 'Dive into the world of cells, genetics, evolution, and ecosystems.',
    category: 'Science',
  },
    {
    id: 'literature',
    title: 'World Literature',
    description: 'Analyze classic literary works from around the globe.',
    category: 'Humanities',
  },
];

export default async function PracticePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      {/* We will add a real header component here later */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Exams</h1>
        <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline">
                Sign Out
            </Button>
        </form>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {practiceExams.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
              <div className="p-6">
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{exam.category}</div>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{exam.title}</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300">{exam.description}</p>
                <div className="mt-6">
                  <Link href={`/practice/${exam.id}`} className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold group">
                    Start Practice
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
