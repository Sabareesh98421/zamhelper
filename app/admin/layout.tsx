
import React from 'react';
import Link from 'next/link';
import { Bars3Icon, HomeIcon, DocumentTextIcon, CheckCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { getCurrentUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-5 overflow-y-auto shadow-lg">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <nav className="mt-8 flex-1 flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-2 space-y-2">
              <Link href="/admin/dashboard" className="group flex items-center px-2 py-3 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                <HomeIcon className="mr-3 h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                Dashboard
              </Link>
              <Link href="/admin/pdfs" className="group flex items-center px-2 py-3 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                <DocumentTextIcon className="mr-3 h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                Manage PDFs
              </Link>
              <Link href="/admin/attempts" className="group flex items-center px-2 py-3 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                <CheckCircleIcon className="mr-3 h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                View Attempts
              </Link>
            </div>
            <div className="mt-auto pt-4 px-2">
               <Link href="/" className="group flex items-center px-2 py-3 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                  <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                  Back to App
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header for mobile */}
        <header className="md:hidden bg-white dark:bg-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button className="p-2 rounded-md text-gray-400 dark:text-gray-500">
                  <Bars3Icon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
