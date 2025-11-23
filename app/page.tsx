import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center text-center p-4">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
          Welcome to Your Exam Prep Hub
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
          Master your subjects with our tailored practice exams. Analyze your performance, identify areas for improvement, and conquer your goals.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/auth/login" className="inline-block bg-blue-600 text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
              Log In & Get Started
          </Link>
          <Link href="/practice" className="inline-block bg-white text-blue-600 font-semibold text-lg px-8 py-4 rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105 border border-blue-600">
              Browse Practice Exams
          </Link>
        </div>
      </main>
    </div>
  );
}
