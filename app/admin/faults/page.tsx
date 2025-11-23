"use client";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ParsingFault } from '@/lib/types';
import { resolveFaultAction } from './actions';

export default function ParsingFaultsPage() {
    const [faults, setFaults] = useState<ParsingFault[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchFaults = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('parsing_faults')
                .select('*')
                .eq('is_resolved', false)
                .order('reported_at', { ascending: false });

            if (error) {
                setError(error.message);
            } else if (data) {
                setFaults(data);
            }
            setLoading(false);
        };

        fetchFaults();
    }, [supabase]);

    const handleResolve = async (faultId: number) => {
        const result = await resolveFaultAction(faultId);
        if (result.success) {
            setFaults(faults.filter(f => f.id !== faultId));
        } else {
            alert(`Failed to resolve: ${result.message}`);
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading parsing faults...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto my-10 p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">PDF Parsing Faults</h1>

            {faults.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No parsing faults found. Great job!</p>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raw Text</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reported At</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {faults.map((fault) => (
                                <tr key={fault.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{fault.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{fault.description}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300"><pre className="whitespace-pre-wrap font-mono text-xs">{fault.raw_text}</pre></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(fault.reported_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleResolve(fault.id)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                                        >
                                            Mark as Resolved
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
