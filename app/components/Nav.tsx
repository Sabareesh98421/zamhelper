
'use client'

import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

async function getUser(): Promise<User | null> {
    const supabase = await createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    return data.user;
}

export default async function Nav() {
    const user = await getUser();

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
                    {user ? (
                        <form action="/auth/signout" method="post">
                            <button type="submit" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">
                                Sign Out
                            </button>
                        </form>
                    ) : (
                        <>
                            <Link href="/login" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0 mr-2">
                                Login
                            </Link>
                            <Link href="/signup" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
