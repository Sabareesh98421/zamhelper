
import React from 'react';
import { UsersIcon, DocumentDuplicateIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { adminStorage } from '@/app/lib/firebase-admin';
import { format, formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

const AdminDashboardPage = async () => {
  let stats = [
    { name: 'Total Users', stat: '0', icon: UsersIcon },
    { name: 'Total PDFs Uploaded', stat: '0', icon: DocumentDuplicateIcon },
    { name: 'Total Exam Attempts', stat: '0', icon: CheckBadgeIcon },
  ];
  let recentAttempts: any[] = [];
  let error: string | null = null;

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Fetch stats and recent activity in parallel
    const [userCountResult, attemptCountResult, pdfCountResult, recentAttemptsResult] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact' }),
      supabaseAdmin.from('attempts').select('id', { count: 'exact' }),
      adminStorage ? adminStorage.getFiles() : Promise.resolve([[]]),
      supabaseAdmin
        .from('attempts')
        .select(`
          id,
          score,
          created_at,
          users ( email ),
          exams ( title )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    stats[0].stat = userCountResult.count?.toLocaleString() || '0';
    stats[2].stat = attemptCountResult.count?.toLocaleString() || '0';
    stats[1].stat = pdfCountResult[0].length.toLocaleString() || '0';
    
    if (recentAttemptsResult.data) {
      recentAttempts = recentAttemptsResult.data;
    }

    if (userCountResult.error || attemptCountResult.error || recentAttemptsResult.error) {
      throw new Error('Failed to fetch data from Supabase.');
    }

  } catch (err: any) {
    console.error("Error fetching dashboard data:", err);
    error = `Failed to load dashboard: ${err.message}`;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg p-5 transition-transform transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-8 w-8 text-indigo-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{item.stat}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white px-6 pt-6">Recent Exam Attempts</h2>
        <div className="flow-root mt-4">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentAttempts.length > 0 ? recentAttempts.map((attempt) => (
              <li key={attempt.id} className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CheckBadgeIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {attempt.users?.email || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Completed <span className="font-medium">{attempt.exams?.title || 'Unknown Exam'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${attempt.score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {attempt.score}%
                    </p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(attempt.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </li>
            )) : (
              <p className="px-6 pb-6 text-gray-500 dark:text-gray-400">No recent activity found.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
