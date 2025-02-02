'use client';
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/firebaseConfig"; // Adjust the import based on your setup
import { doc, setDoc } from "firebase/firestore";

const CreateAssignment = () => {
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const [timeInterval, setTimeInterval] = useState<number | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("id"); // Fetch the documentId from the URL query parameter

  const handleSetNumQuestions = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setNumQuestions(num);
    } else {
      alert("Please enter a valid number of questions.");
    }
  };

  const handleSetTimeInterval = (value: string) => {
    const interval = parseInt(value, 10);
    if (!isNaN(interval) && interval > 0) {
      setTimeInterval(interval);
    } else {
      alert("Please enter a valid time interval.");
    }
  };

  const handleSaveAssignment = async () => {
    if (!documentId) {
      alert("Invalid document ID. Please check the URL.");
      return;
    }

    if (numQuestions === null || timeInterval === null || questions.length !== numQuestions) {
      alert("Please complete all fields before saving.");
      return;
    }

    try {
      const sequence = questions.map((question, index) => ({
        questionNumber: index + 1,
        question,
      }));

      await setDoc(doc(db, "Assignment", documentId), {
        id: documentId,
        numQuestions,
        timeInterval,
        sequence,
        createdAt: new Date(),
      });

      alert("Assignment created successfully!");
      router.push("/"); // Redirect to the desired page after creation
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("An error occurred while creating the assignment.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10">
      <div className="bg-orange-500 shadow-md rounded-lg p-8 w-[800px]">
        <h1 className="text-2xl font-bold text-center mb-5">Create Assignment</h1>

        {step === 1 && (
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              onChange={(e) => handleSetNumQuestions(e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
            />
            <button
              onClick={() => setStep(2)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
            >
              Set
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium">
              Time Interval (seconds)
            </label>
            <input
              type="number"
              min="1"
              onChange={(e) => handleSetTimeInterval(e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
            />
            <button
              onClick={() => setStep(3)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
            >
              Set
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            {Array.from({ length: numQuestions || 0 }).map((_, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-lg font-semibold">Question {index + 1}</h4>
                <input
                  type="text"
                  placeholder="Enter question (e.g., 1+2-3*2)"
                  onBlur={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index] = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
            ))}
            <button
              onClick={handleSaveAssignment}
              className="bg-green-500 text-white px-4 py-2 rounded-md mt-3"
            >
              Save Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAssignment;

