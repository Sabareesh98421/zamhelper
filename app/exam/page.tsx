
import React from 'react';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function getExams() {
  const examsCollection = collection(db, 'exams');
  const examSnapshot = await getDocs(examsCollection);
  const exams = examSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return exams;
}

const ExamPage = async () => {
  const exams = await getExams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Exams</h1>
        <div className="flex gap-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Random PDF
          </button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Random Content
          </button>
        </div>
      </div>
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <Link key={exam.id} href={`/exam/${exam.id}`}>
              <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{exam.name}</h5>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">No exams found. <Link href="/upload" className="text-blue-500 hover:underline">Upload a PDF</Link> to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
