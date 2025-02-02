
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const SequencePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('id'); // Get assignmentId from query parameter

  const [sequence, setSequence] = useState<{ questionNumber: number; question: string }[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeInterval, setTimeInterval] = useState(0);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [calculatedAnswer, setCalculatedAnswer] = useState<string | null>(null); // Store calculated answer

  useEffect(() => {
    // Fetch assignment data from Firebase
    const fetchAssignment = async () => {
      if (!assignmentId) return;

      try {
        const docRef = doc(db, 'Assignment', assignmentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const assignmentData = docSnap.data();
          const fetchedSequence = assignmentData.sequence || [];
          const fetchedTimeInterval = assignmentData.timeInterval || 0;

          setSequence(fetchedSequence);
          setTimeInterval(fetchedTimeInterval);
          prepareCurrentSequence(fetchedSequence[0]?.question || '');
        } else {
          console.error('No document found with the given assignmentId.');
          alert('Assignment not found. Redirecting to home.');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching assignment data:', error);
        alert('Failed to fetch assignment. Redirecting to home.');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, router]);

  const prepareCurrentSequence = (question: string) => {
    const sequence: string[] = [];
    const regex = /([+\-*/÷]?\d+(\.\d+)?)/g; // Matches numbers with optional leading operators
    const matches = question.match(regex);

    if (matches) {
      sequence.push(...matches);
    }

    setCurrentSequence(sequence);
    setCurrentSequenceIndex(0);
    setShowAnswer(false);
    setCalculatedAnswer(null); // Reset answer when preparing a new sequence
  };

  useEffect(() => {
    if (!isPaused && currentSequenceIndex < currentSequence.length) {
      const beep = new Audio('/beep.mp3');
      beep.play();
      const timer = setTimeout(() => {
        setCurrentSequenceIndex((prev) => prev + 1);
      }, timeInterval * 1000);

      return () => clearTimeout(timer);
    }
  }, [currentSequenceIndex, currentSequence, isPaused, timeInterval]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < sequence.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      prepareCurrentSequence(sequence[currentQuestionIndex + 1].question);
      setIsPaused(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex - 1 >= 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      prepareCurrentSequence(sequence[currentQuestionIndex - 1].question);
      setIsPaused(false);
    }
  };

  const calculateAnswer = (question: string) => {
    try {
      const sanitizedExpression = question
        .replace(/÷/g, '/')
        .replace(/[^\d+\-*/().]/g, ''); // Remove invalid characters

      const answer = eval(sanitizedExpression);

      if (!isNaN(answer)) {
        setCalculatedAnswer(answer.toString());
      } else {
        setCalculatedAnswer('Invalid Expression');
      }
    } catch (error) {
      setCalculatedAnswer('Invalid Expression');
    }
  };

  const handleShowAnswer = () => {
    if (currentSequence.length > 0) {
      calculateAnswer(currentSequence.join('')); // Join sequence parts without spaces
    }
    setShowAnswer(true);
  };

  const formatQuestionForDisplay = (question: string) => {
    return question
      .replace(/\*/g, 'x') // Replace * with x
      .replace(/\//g, '÷'); // Replace / with ÷
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10">
      <div className="bg-orange-500 shadow-md rounded-lg p-8 w-[800px]">
        <h3 className="text-8xl font-semibold text-center">
          {String.fromCharCode(65 + currentQuestionIndex)}
        </h3>
        <div className="text-9xl font-bold text-center my-8">
          {currentSequenceIndex < currentSequence.length
            ? formatQuestionForDisplay(currentSequence[currentSequenceIndex])
            : 'Completed!'}
        </div>

        {currentSequenceIndex >= currentSequence.length && !showAnswer && (
          <button
            onClick={handleShowAnswer}
            className="bg-green-500 text-white px-4 py-2 rounded-md mx-auto block"
          >
            Show Answer
          </button>
        )}

        {showAnswer && calculatedAnswer && (
          <p className="text-6xl text-center mt-4">
            Answer: {calculatedAnswer || 'N/A'}
          </p>
        )}

        <div className="flex justify-between mt-10">
          {currentSequenceIndex >= currentSequence.length && currentQuestionIndex > 0 && (
            <button
              onClick={handlePreviousQuestion}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Previous
            </button>
          )}

          {currentSequenceIndex >= currentSequence.length && currentQuestionIndex < sequence.length - 1 && (
            <button
              onClick={handleNextQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Next
            </button>
          )}
          {currentSequenceIndex >= currentSequence.length && currentQuestionIndex === sequence.length - 1 && (
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Home
            </button>
          )}
        </div>

        {currentSequenceIndex < currentSequence.length && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`mt-5 px-4 py-2 rounded-md ${isPaused ? 'bg-blue-500' : 'bg-red-500'} text-white mx-auto block`}
          >
            {isPaused ? 'Continue' : 'Pause'}
          </button>
        )}
        {currentSequenceIndex < currentSequence.length && (
          <p className="text-center text-lg mt-2">Sequence in progress...</p>
        )}
      </div>
    </div>
  );
};

export default SequencePage;
