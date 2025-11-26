
import React from 'react';
import { getOrCreateQuestions } from './actions';

const ExamQuestionPage = async ({ params }: { params: { id: string } }) => {
  const questions = await getOrCreateQuestions(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Exam: {params.id}</h1>
      
      <form>
        {questions.map((q, index) => (
          <div key={q.id} className="mb-8">
            <p className="text-xl font-semibold mb-2">{index + 1}. {q.question}</p>
            <div className="flex flex-col gap-2">
              {Array.isArray(q.options) && q.options.map((option, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input type="radio" name={`question-${q.id}`} value={option} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ExamQuestionPage;
