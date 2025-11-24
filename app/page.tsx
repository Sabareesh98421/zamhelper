import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { login } from '@/app/auth/actions';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center text-center p-4">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
          Welcome to Your Exam Prep Hub
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
          Master your subjects with our tailored practice exams. Analyze your performance, identify areas for improvement, and conquer your goals.
        </p>
        <div className="mt-10 flex justify-center items-center">
          {!session ? (
            <form action={login}>
              <Button
                variant="outline"
                className="w-full max-w-sm bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105 border border-gray-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.3v2.84C4.13 20.53 7.76 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.3C1.45 8.84 1 10.66 1 12.5s.45 3.66 1.3 5.43l3.54-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.76 1 4.13 3.47 2.3 6.96l3.54 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </Button>
            </form>
          ) : (
            <Link href="/practice" className="inline-block bg-white text-blue-600 font-semibold text-lg px-8 py-4 rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105 border border-blue-600">
                Browse Practice Exams
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
