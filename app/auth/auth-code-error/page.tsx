'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const code = searchParams.get('code');

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Error</h1>
        <p className="text-gray-500 dark:text-gray-400">There was a problem authenticating your account.</p>
        {message && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Details:</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
         {code && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Code:</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{code}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <p className="text-gray-500 dark:text-gray-400">
          We couldn't sign you in. Please try again. If the problem persists, please contact support.
        </p>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-900"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </main>
  );
}
