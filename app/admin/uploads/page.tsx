
import { createSupabaseServerClient } from "@/lib/supabase/server"; // Correctly import the utility
import Link from 'next/link';

async function getUploads() {
    // Use the centralized utility to create the Supabase client
    const supabase = await createSupabaseServerClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('uploads')
        .select('id, file_name, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching uploads:", error);
        return [];
    }

    return data;
}

export default async function UploadsDashboard() {
    const uploads = await getUploads();

    return (
        <div className="max-w-7xl mx-auto my-12 p-8">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">My Uploads</h1>
                <p className="mt-3 text-xl text-gray-600 dark:text-gray-300">Review your past uploads and take the generated exams.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {uploads.length > 0 ? (
                        uploads.map((upload) => (
                            <li key={upload.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                <Link href={`/admin/uploads/${upload.id}/review`} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{upload.file_name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Uploaded on: {new Date(upload.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${upload.status === 'processed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                            {upload.status}
                                        </span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Take Exam &rarr;</span>
                                    </div>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="p-8 text-center">
                            <p className="text-lg text-gray-500 dark:text-gray-400">You haven't uploaded any documents yet.</p>
                            <Link href="/upload" className="mt-4 inline-block px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md">
                                Upload Now
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
