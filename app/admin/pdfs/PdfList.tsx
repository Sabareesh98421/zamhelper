'use client';

import React, { useTransition } from 'react';
import { DocumentArrowDownIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { deletePdf, getDownloadUrl } from './actions';

// Define a type for the file prop for better type safety
interface FileData {
  name: string;
  size: number;
  createdAt: string;
}

const PdfList = ({ files, error }: { files: FileData[], error: string | null }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (fileName: string) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}? This action cannot be undone.`)) {
      startTransition(async () => {
        const result = await deletePdf(fileName);
        if (result?.error) {
          alert(`Error: ${result.error}`);
        }
        // Re-fetching or revalidating data will be handled by Next.js cache invalidation
      });
    }
  };

  const handleDownload = (fileName: string) => {
    startTransition(async () => {
      const result = await getDownloadUrl(fileName);
      if (result.url) {
        window.open(result.url, '_blank');
      } else if (result.error) {
        alert(`Error getting download link: ${result.error}`);
      }
    });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Upload Date</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {files.length > 0 ? files.map((file) => (
              <tr key={file.name} className={isPending ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{file.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{format(new Date(file.createdAt), 'PPpp')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-4">
                    <button
                      onClick={() => handleDownload(file.name)}
                      disabled={isPending}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50">
                      <DocumentArrowDownIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.name)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No files found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PdfList;