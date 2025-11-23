import { Suspense } from 'react';
import PracticeSession from './PracticeSession';

export default function PracticeSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PracticeSession />
    </Suspense>
  );
}
