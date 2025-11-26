'use client'

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/">
          <span className="font-semibold text-xl tracking-tight">ZamHelper</span>
        </Link>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          <Link href="/exam" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
            Exams
          </Link>
          <Link href="/upload" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
            Upload
          </Link>
          {user && (
            <Link href="/admin/dashboard" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
              Admin
            </Link>
          )}
        </div>
        <div>
          {!loading && (
            <>
              {user && (
                <form action="/auth/signout" method="post">
                  <button type="submit" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">
                    Sign Out
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
