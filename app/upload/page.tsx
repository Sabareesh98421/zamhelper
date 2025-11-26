
'use client'

import { useState, useRef, useCallback, useEffect } from 'react';
import { uploadPdf } from './actions';
import { FiUploadCloud } from 'react-icons/fi';
import { supabase } from '@/app/lib/supabase'; // Using Supabase client
import type { User } from '@supabase/supabase-js'; // Using Supabase User type
import Link from 'next/link';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Supabase auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Check initial user session
    async function getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setAuthLoading(false);
    }

    getUser();

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage('Please select a PDF file.');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setMessage('');
      }
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
        setSelectedFile(file);
        setMessage('');
    } else {
        setMessage('Please drop a PDF file.');
        setSelectedFile(null);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const result = await uploadPdf(formData);
      if (result.message.includes('successfully')) {
        setMessage(`Success: ${selectedFile.name} has been uploaded and stored.`);
      } else {
        setMessage(`Error: ${result.message}`);
      }
      setSelectedFile(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
    }
    setIsUploading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
        <div className="max-w-lg w-full text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Access Denied</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">You must be logged in to upload exam papers.</p>
            <Link href="/" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">
                Go to Login
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
        <div className="max-w-lg w-full text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Upload Your Exam Paper</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Drag and drop a PDF file or click to select a file.</p>
            
            <form onSubmit={handleSubmit}>
                <label 
                    htmlFor="file-upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex justify-center items-center w-full h-64 px-6 transition bg-white dark:bg-gray-800 border-2 ${isDragOver ? 'border-blue-400' : 'border-gray-300 dark:border-gray-600'} border-dashed rounded-md cursor-pointer`}>
                    <div className="space-y-1 text-center">
                        <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF only, up to 10MB</p>
                    </div>
                    <input id="file-upload" name="file" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" />
                </label>

                {selectedFile && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Selected file:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedFile.name}</p>
                </div>
                )}

                <button 
                    type="submit" 
                    disabled={!selectedFile || isUploading}
                    className="w-full mt-6 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
                    {isUploading ? 'Uploading...' : 'Upload & Process PDF'}
                </button>

                {message && (
                <div className={`mt-6 text-sm text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
                    {message}
                </div>
                )}
            </form>
        </div>
    </div>
  );
}
