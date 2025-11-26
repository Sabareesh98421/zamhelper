
import React from 'react';
import { getOrCreateQuestions } from './actions';
import { supabase } from '@/app/lib/supabase'; // Import supabase client

// This is a server component, so we can fetch data directly.
const ExamQuestionPage = async ({ params }: { params: { id: string } }) => {
  
  // Fetch the exam details to get the name
  const { data: examData, error: examError } = await supabase
    .from('exams') // Corrected table name
    .select('title') // Corrected column name
    .eq('id', params.id)
    .single();

  if (examError || !examData) {
    console.error('Error fetching exam details:', examError);
    // Render a fallback or error page if the exam isn't found
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Exam Not Found</h1>
        <p>We couldn't find the exam you were looking for.</p>
      </div>
    );
  }

  // Fetch the questions for the exam
  const questions = await getOrCreateQuestions(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Display the actual exam name */}
      <h1 className="text-4xl font-bold mb-4">Exam: {examData.title}</h1>
      
      <form>
        {questions.map((q, index) => (
          <div key={q.id} className="mb-8 p-4 border rounded-lg shadow-sm">
            <p className="text-xl font-semibold mb-2">{index + 1}. {q.question}</p>
            {/* Ensure options are displayed correctly */}
            <div className="flex flex-col gap-2">
              {Array.isArray(q.options) && q.options.length > 0 ? (
                q.options.map((option, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
                    <input type="radio" name={`question-${q.id}`} value={option} className="form-radio h-5 w-5 text-blue-600" />
                    <span>{option}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500">No options available for this question.</p>
              )}
            </div>
          </div>
        ))}
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
          Submit Answers
        </button>
      </form>
    </div>
  );
};

export default ExamQuestionPage;
