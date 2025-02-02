'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Abacusnew = () => {
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const [timeInterval, setTimeInterval] = useState<number | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [results, setResults] = useState<(number | string)[]>([]);
  const [step, setStep] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

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

  const handleCalculateResult = (expression: string) => {
    try {
      const sanitizedExpression = expression.replace(/[^\d+\-*/().]/g, "");
      const result = new Function(`return ${sanitizedExpression}`)();
      return Number.isFinite(result) ? result : "Invalid Expression";
    } catch {
      return "Invalid Expression";
    }
  };

  const handleSaveQuestions = () => {
    if (questions.length === numQuestions) {
      const calculatedResults = questions.map((question) =>
        handleCalculateResult(question)
      );
      setResults(calculatedResults);
      alert("Assignment submitted successfully.");
      setStep(5);
    } else {
      alert("Please fill all the questions before submitting.");
    }
  };

  const handleStartAssignment = () => {
    setCurrentQuestionIndex(0);
    prepareCurrentSequence(questions[0]);
    setCurrentSequenceIndex(0);
    setIsPaused(false);
    setStep(6);
  };

  const prepareCurrentSequence = (question: string) => {
    const sequence: string[] = [];
    const regex = /([-]?\d+|[*/][-]?\d+)/g; // Matches numbers or operators followed by numbers (e.g., *3, -4, /2).
    const matches = question.match(regex);
    if (matches) {
      sequence.push(...matches.map((item) => item.replace(/\*/g, "×").replace(/\//g, "÷")));
    }
    setCurrentSequence(sequence);
  };

  useEffect(() => {
    if (
      step === 6 &&
      timeInterval &&
      !isPaused &&
      currentSequenceIndex < currentSequence.length
    ) {
      const beep = new Audio("/beep.mp3");
      beep.play();
      const timer = setTimeout(() => {
        setCurrentSequenceIndex((prev) => prev + 1);
      }, timeInterval * 1000);

      return () => clearTimeout(timer);
    }
  }, [step, timeInterval, currentSequenceIndex, currentSequence, isPaused]);

  const handleNextQuestion = () => {
    setShowAnswer(false);
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    prepareCurrentSequence(questions[nextIndex]);
    setCurrentSequenceIndex(0);
    setIsPaused(false);
  };

  const handlePreviousQuestion = () => {
    setShowAnswer(false);
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    prepareCurrentSequence(questions[prevIndex]);
    setCurrentSequenceIndex(0);
    setIsPaused(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10 ">
      <div className="bg-orange-500 shadow-md rounded-lg p-8 w-[800px] ">
        <h1 className="text-2xl font-bold text-center mb-5">Abacus Assignment</h1>

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
              onClick={handleSaveQuestions}
              className="bg-green-500 text-white px-4 py-2 rounded-md mt-3"
            >
              Save Questions
            </button>
          </div>
        )}
        {step === 5 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-3">Assignment</h2>
            <button
              onClick={handleStartAssignment}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
            >
              Start
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="text-center">
            <h3 className="text-8xl font-semibold">
              Question {currentQuestionIndex + 1}
            </h3>
            <div className="text-8xl font-extrabold my-5">
              {currentSequenceIndex < currentSequence.length
                ? currentSequence[currentSequenceIndex]
                : "Complete!"}
            </div>
            {currentSequenceIndex >= currentSequence.length && (
              <div className="flex justify-between mt-5">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePreviousQuestion}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  Answer
                </button>
                {currentQuestionIndex < (numQuestions || 0) - 1 && (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
            {currentSequenceIndex < currentSequence.length && (
              <div className="flex justify-center gap-3 mt-5">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-4 py-2 rounded-md ${
                    isPaused ? "bg-blue-500" : "bg-red-500"
                  } text-white`}
                >
                  {isPaused ? "Continue" : "Stop"}
                </button>
              </div>
            )}
            {showAnswer && (
              <p className="text-8xl mt-3">
                Answer: {results[currentQuestionIndex]}
              </p>
            )}
          </div>
        )}
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3">
        Home
      </button>
    </div>
  );
};

export default Abacusnew;

// 'use client';
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// const Abacusnew = () => {
//   const [numQuestions, setNumQuestions] = useState<number | null>(null);
//   const [timeInterval, setTimeInterval] = useState<number | null>(null);
//   const [questions, setQuestions] = useState<string[]>([]);
//   const [results, setResults] = useState<(number | string)[]>([]);
//   const [step, setStep] = useState(1);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [currentNumbers, setCurrentNumbers] = useState<string[]>([]);
//   const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [isPaused, setIsPaused] = useState(false); // State for pausing/resuming the sequence
//   const router = useRouter();

//   const handleSetNumQuestions = (value: string) => {
//     const num = parseInt(value, 10);
//     if (!isNaN(num) && num > 0) {
//       setNumQuestions(num);
//     } else {
//       alert("Please enter a valid number of questions.");
//     }
//   };

//   const handleSetTimeInterval = (value: string) => {
//     const interval = parseInt(value, 10);
//     if (!isNaN(interval) && interval > 0) {
//       setTimeInterval(interval);
//     } else {
//       alert("Please enter a valid time interval.");
//     }
//   };

//   const handleCalculateResult = (expression: string) => {
//     try {
//       const sanitizedExpression = expression.replace(/[^\d+\-*/().]/g, "");
//       const result = new Function(`return ${sanitizedExpression}`)();
//       return Number.isFinite(result) ? result : "Invalid Expression";
//     } catch {
//       return "Invalid Expression";
//     }
//   };

//   const handleSaveQuestions = () => {
//     if (questions.length === numQuestions) {
//       const calculatedResults = questions.map((question) =>
//         handleCalculateResult(question)
//       );
//       setResults(calculatedResults);
//       alert("Assignment submitted successfully.");
//       setStep(5); // Move to the start button step
//     } else {
//       alert("Please fill all the questions before submitting.");
//     }
//   };

//   const handleStartAssignment = () => {
//     setCurrentQuestionIndex(0);
//     setCurrentNumbers(questions[0].split(/[\s+*-/]/).filter((n) => n));
//     setCurrentNumberIndex(0);
//     setIsPaused(false); // Ensure sequence starts running
//     setStep(6);
//   };

//   useEffect(() => {
//     if (step === 6 && timeInterval && !isPaused && currentNumberIndex < currentNumbers.length) {
//       const beep = new Audio("/censor-beep-4.mp3"); // Reference to the audio file in the public folder
//       beep.play();
//       const timer = setTimeout(() => {
//         setCurrentNumberIndex((prev) => prev + 1);
//       }, timeInterval * 1000);

//       return () => clearTimeout(timer);
//     }
//   }, [step, timeInterval, currentNumberIndex, currentNumbers, isPaused]);

//   const handleNextQuestion = () => {
//     setShowAnswer(false);
//     const nextIndex = currentQuestionIndex + 1;
//     setCurrentQuestionIndex(nextIndex);
//     setCurrentNumbers(questions[nextIndex].split(/[\s+*-/]/).filter((n) => n));
//     setCurrentNumberIndex(0);
//     setIsPaused(false); // Reset to ensure Stop button is shown for the next question
//   };

//   const handlePreviousQuestion = () => {
//     setShowAnswer(false);
//     const prevIndex = currentQuestionIndex - 1;
//     setCurrentQuestionIndex(prevIndex);
//     setCurrentNumbers(questions[prevIndex].split(/[\s+*-/]/).filter((n) => n));
//     setCurrentNumberIndex(0);
//     setIsPaused(false); // Reset to ensure Stop button is shown for the previous question
//   };

//   const handleClick = () => {
//     if (router) {
//       router.push(`/new-assignment`);
//     } else {
//       console.log("Error in router mount.");
//     }
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10 ">
//       <div className="bg-orange-500 shadow-md rounded-lg p-8 w-[800px] ">
//         <h1 className="text-2xl font-bold text-center mb-5">Abacus Assignment</h1>

//         {step === 1 && (
//           <div className="mb-5">
//             <label className="block mb-2 text-sm font-medium">
//               Number of Questions
//             </label>
//             <input
//               type="number"
//               min="1"
//               onChange={(e) => handleSetNumQuestions(e.target.value)}
//               className="border px-3 py-2 rounded-md w-full"
//             />
//             <button
//               onClick={() => setStep(2)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Set
//             </button>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="mb-5">
//             <label className="block mb-2 text-sm font-medium">
//               Time Interval (seconds)
//             </label>
//             <input
//               type="number"
//               min="1"
//               onChange={(e) => handleSetTimeInterval(e.target.value)}
//               className="border px-3 py-2 rounded-md w-full"
//             />
//             <button
//               onClick={() => setStep(3)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Set
//             </button>
//           </div>
//         )}

//         {step === 3 && (
//           <div>
//             {Array.from({ length: numQuestions || 0 }).map((_, index) => (
//               <div key={index} className="mb-4">
//                 <h4 className="text-lg font-semibold">Question {index + 1}</h4>
//                 <input
//                   type="text"
//                   placeholder="Enter question (e.g., 1+2-3*2)"
//                   onBlur={(e) => {
//                     const newQuestions = [...questions];
//                     newQuestions[index] = e.target.value;
//                     setQuestions(newQuestions);
//                   }}
//                   className="border px-3 py-2 rounded-md w-full"
//                 />
//               </div>
//             ))}
//             <button
//               onClick={handleSaveQuestions}
//               className="bg-green-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Save Questions
//             </button>
//           </div>
//         )}

//         {step === 5 && (
//           <div className="text-center">
//             <h2 className="text-xl font-semibold mb-3">Assignment</h2>
//             <button
//               onClick={handleStartAssignment}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Start
//             </button>
//           </div>
//         )}

//         {step === 6 && (
//           <div className="text-center">
//             <h3 className="text-lg font-semibold">
//               Question {currentQuestionIndex + 1}
//             </h3>
//             <div className="text-8xl font-extrabold my-5">
//               {currentNumberIndex < currentNumbers.length
//                 ? currentNumbers[currentNumberIndex]
//                 : "Complete!"}
//             </div>
//             {currentNumberIndex >= currentNumbers.length && (
//               <div className="flex justify-between mt-5">
//                 {currentQuestionIndex > 0 && (
//                   <button
//                     onClick={handlePreviousQuestion}
//                     className="bg-gray-500 text-white px-4 py-2 rounded-md"
//                   >
//                     Previous
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setShowAnswer(true)}
//                   className="bg-green-500 text-white px-4 py-2 rounded-md"
//                 >
//                   Answer
//                 </button>
//                 {currentQuestionIndex < (numQuestions || 0) - 1 && (
//                   <button
//                     onClick={handleNextQuestion}
//                     className="bg-blue-500 text-white px-4 py-2 rounded-md"
//                   >
//                     Next
//                   </button>
//                 )}
//               </div>
//             )}
//             {currentNumberIndex < currentNumbers.length && (
//               <div className="flex justify-center gap-3 mt-5">
//                 <button
//                   onClick={() => setIsPaused(!isPaused)}
//                   className={`px-4 py-2 rounded-md ${
//                     isPaused ? "bg-blue-500" : "bg-red-500"
//                   } text-white`}
//                 >
//                   {isPaused ? "Continue" : "Stop"}
//                 </button>
//               </div>
//             )}
//             {showAnswer && (
//               <p className="text-3xl mt-3">
//                 Answer: {results[currentQuestionIndex]}
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//       <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3">
//         Home
//       </button>
//     </div>
//   );
// };

// export default Abacusnew;


// 'use client';
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Import the useRouter hook

// const Abacusnew = () => {
//   const [numQuestions, setNumQuestions] = useState<number | null>(null);
//   const [timeInterval, setTimeInterval] = useState<number | null>(null);
//   const [questions, setQuestions] = useState<string[]>([]);
//   const [results, setResults] = useState<(number | string)[]>([]);
//   const [step, setStep] = useState(1);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [currentNumbers, setCurrentNumbers] = useState<string[]>([]);
//   const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
//   const [showAnswer, setShowAnswer] = useState(false);
//   const router = useRouter(); // Initialize the route

//   const handleSetNumQuestions = (value: string) => {
//     const num = parseInt(value, 10);
//     if (!isNaN(num) && num > 0) {
//       setNumQuestions(num);
//     } else {
//       alert("Please enter a valid number of questions.");
//     }
//   };

//   const handleSetTimeInterval = (value: string) => {
//     const interval = parseInt(value, 10);
//     if (!isNaN(interval) && interval > 0) {
//       setTimeInterval(interval);
//     } else {
//       alert("Please enter a valid time interval.");
//     }
//   };

//   const handleCalculateResult = (expression: string) => {
//     try {
//       const sanitizedExpression = expression.replace(/[^\d+\-*/().]/g, "");
//       const result = new Function(`return ${sanitizedExpression}`)();
//       return Number.isFinite(result) ? result : "Invalid Expression";
//     } catch {
//       return "Invalid Expression";
//     }
//   };

//   const handleSaveQuestions = () => {
//     if (questions.length === numQuestions) {
//       const calculatedResults = questions.map((question) =>
//         handleCalculateResult(question)
//       );
//       setResults(calculatedResults);
//       alert("Assignment submitted successfully.");
//       setStep(5); // Move to the start button step
//     } else {
//       alert("Please fill all the questions before submitting.");
//     }
//   };

//   const handleStartAssignment = () => {
//     setCurrentQuestionIndex(0);
//     setCurrentNumbers(questions[0].split(/[\s+*-/]/).filter((n) => n));
//     setCurrentNumberIndex(0);
//     setStep(6);
//   };

//   useEffect(() => {
//     if (step === 6 && timeInterval && currentNumberIndex < currentNumbers.length) {
//         const beep = new Audio("/censor-beep-4.mp3"); // Reference to the audio file in the public folder
//       beep.play();
//       const timer = setTimeout(() => {
//         setCurrentNumberIndex((prev) => prev + 1);
//       }, timeInterval * 1000);

//       return () => clearTimeout(timer);
//     }
//   }, [step, timeInterval, currentNumberIndex, currentNumbers]);

//   const handleNextQuestion = () => {
//     setShowAnswer(false);
//     const nextIndex = currentQuestionIndex + 1;
//     setCurrentQuestionIndex(nextIndex);
//     setCurrentNumbers(questions[nextIndex].split(/[\s+*-/]/).filter((n) => n));
//     setCurrentNumberIndex(0);
//   };

//   const handlePreviousQuestion = () => {
//     setShowAnswer(false);
//     const prevIndex = currentQuestionIndex - 1;
//     setCurrentQuestionIndex(prevIndex);
//     setCurrentNumbers(questions[prevIndex].split(/[\s+*-/]/).filter((n) => n));
//     setCurrentNumberIndex(0);
//   };

//   const handleClick = () => {
//     if(router){
//       router.push(`/new-assignment`);
//     } // Navigate to a dynamic route
//     else{
//       console.log('error in the router mount');
      
//     }
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen  flex flex-col items-center py-10 ">
//       <div className="bg-orange-500 shadow-md rounded-lg p-8 w-[800px] ">
//         <h1 className="text-2xl font-bold text-center mb-5">Abacus Assignment</h1>

//         {step === 1 && (
//           <div className="mb-5">
//             <label className="block mb-2 text-sm font-medium">Number of Questions</label>
//             <input
//               type="number"
//               min="1"
//               onChange={(e) => handleSetNumQuestions(e.target.value)}
//               className="border px-3 py-2 rounded-md w-full"
//             />
//             <button
//               onClick={() => setStep(2)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Set
//             </button>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="mb-5">
//             <label className="block mb-2 text-sm font-medium">Time Interval (seconds)</label>
//             <input
//               type="number"
//               min="1"
//               onChange={(e) => handleSetTimeInterval(e.target.value)}
//               className="border px-3 py-2 rounded-md w-full"
//             />
//             <button
//               onClick={() => setStep(3)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Set
//             </button>
//           </div>
//         )}

//         {step === 3 && (
//           <div>
//             {Array.from({ length: numQuestions || 0 }).map((_, index) => (
//               <div key={index} className="mb-4">
//                 <h4 className="text-lg font-semibold">Question {index + 1}</h4>
//                 <input
//                   type="text"
//                   placeholder="Enter question (e.g., 1+2-3*2)"
//                   onBlur={(e) => {
//                     const newQuestions = [...questions];
//                     newQuestions[index] = e.target.value;
//                     setQuestions(newQuestions);
//                   }}
//                   className="border px-3 py-2 rounded-md w-full"
//                 />
//               </div>
//             ))}
//             <button
//               onClick={handleSaveQuestions}
//               className="bg-green-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Save Questions
//             </button>
//           </div>
//         )}

//         {step === 5 && (
//           <div className="text-center">
//             <h2 className="text-xl font-semibold mb-3">Assignment</h2>
//             <button
//               onClick={handleStartAssignment}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Start
//             </button>
//           </div>
//         )}

//         {step === 6 && (
//           <div className="text-center">
//             <h3 className="text-lg font-semibold">
//               Question {currentQuestionIndex + 1}
//             </h3>
//             <div className="text-8xl font-extrabold my-5 ">
//               {currentNumberIndex < currentNumbers.length
//                 ? currentNumbers[currentNumberIndex]
//                 : "Complete!"}
//             </div>
//             {currentNumberIndex >= currentNumbers.length && (
//               <div className="flex justify-between mt-5">
//                 {currentQuestionIndex > 0 && (
//                   <button
//                     onClick={handlePreviousQuestion}
//                     className="bg-gray-500 text-white px-4 py-2 rounded-md"
//                   >
//                     Previous
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setShowAnswer(true)}
//                   className="bg-green-500 text-white px-4 py-2 rounded-md"
//                 >
//                   Answer
//                 </button>
//                 {currentQuestionIndex < (numQuestions || 0) - 1 && (
//                   <button
//                     onClick={handleNextQuestion}
//                     className="bg-blue-500 text-white px-4 py-2 rounded-md"
//                   >
//                     Next
//                   </button>
//                 )}
//               </div>
//             )}
//             {showAnswer && (
//               <p className="text-3xl mt-3">
//                 Answer: {results[currentQuestionIndex]}
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//       <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3">
//           Home 
//       </button>
//     </div>
//   );
// };

// export default Abacusnew;

// import { useState } from "react";

// const Abacusnew = () => {
//   const [numQuestions, setNumQuestions] = useState<number | null>(null);
//   const [timeInterval, setTimeInterval] = useState<number | null>(null);
//   const [questions, setQuestions] = useState<string[]>([]);
//   const [results, setResults] = useState<(number | string)[]>([]);
//   const [step, setStep] = useState(1);

//   const handleSetNumQuestions = (value: string) => {
//     const num = parseInt(value, 10);
//     if (!isNaN(num) && num > 0) {
//       setNumQuestions(num);
//     } else {
//       alert("Please enter a valid number of questions.");
//     }
//   };

//   const handleSetTimeInterval = (value: string) => {
//     const interval = parseInt(value, 10);
//     if (!isNaN(interval) && interval > 0) {
//       setTimeInterval(interval);
//     } else {
//       alert("Please enter a valid time interval.");
//     }
//   };

//   const handleCalculateResult = (expression: string) => {
//     try {
//       const sanitizedExpression = expression.replace(/[^\d+\-*/().]/g, "");
//       const result = new Function(`return ${sanitizedExpression}`)();
//       return Number.isFinite(result) ? result : "Invalid Expression";
//     } catch {
//       return "Invalid Expression";
//     }
//   };

//   const handleSaveQuestions = () => {
//     if (questions.length === numQuestions) {
//       const calculatedResults = questions.map((question) =>
//         handleCalculateResult(question)
//       );
//       setResults(calculatedResults);
//       alert("Assignment submitted successfully.");
//       setStep(4); // Move to the results step
//     } else {
//       alert("Please fill all the questions before submitting.");
//     }
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10">
//       <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
//         <h1 className="text-2xl font-bold text-center mb-5">Abacus Assignment</h1>
//         {step === 1 && (
//           <div className="mb-5">
//             <label className="block mb-2 text-sm font-medium">Number of Questions</label>
//             <input
//               type="number"
//               min="1"
//               onChange={(e) => handleSetNumQuestions(e.target.value)}
//               className="border px-3 py-2 rounded-md w-full"
//             />
//             <button
//               onClick={() => setStep(2)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Set
//             </button>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="mb-5">
//             <label className="block mb-2 text-sm font-medium">Time Interval (seconds)</label>
//             <input
//               type="number"
//               min="1"
//               onChange={(e) => handleSetTimeInterval(e.target.value)}
//               className="border px-3 py-2 rounded-md w-full"
//             />
//             <button
//               onClick={() => setStep(3)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Set
//             </button>
//           </div>
//         )}

//         {step === 3 && (
//           <div>
//             {Array.from({ length: numQuestions || 0 }).map((_, index) => (
//               <div key={index} className="mb-4">
//                 <h4 className="text-lg font-semibold">Question {index + 1}</h4>
//                 <input
//                   type="text"
//                   id={`question-${index}`}
//                   placeholder="Enter question (e.g., 1+2-3*2)"
//                   onBlur={(e) => {
//                     const newQuestions = [...questions];
//                     newQuestions[index] = e.target.value;
//                     setQuestions(newQuestions);
//                   }}
//                   className="border px-3 py-2 rounded-md w-full"
//                 />
//               </div>
//             ))}
//             <button
//               onClick={handleSaveQuestions}
//               className="bg-green-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Save Questions
//             </button>
//           </div>
//         )}

//         {step === 4 && results.length > 0 && (
//           <div className="mt-5">
//             <h3 className="text-xl font-semibold mb-3">Results:</h3>
//             {results.map((result, index) => (
//               <p key={index} className="text-lg">
//                 Question {index + 1}: {result}
//               </p>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Abacusnew;




// import { useState } from "react";

// const Abacusnew = () => {
//   const [numQuestions, setNumQuestions] = useState<number | null>(null);
//   const [timeInterval, setTimeInterval] = useState<number | null>(null);
//   const [questions, setQuestions] = useState<string[]>([]);
//   const [step, setStep] = useState(1);

//   const handleSetNumQuestions = (value: string) => {
//     const num = parseInt(value, 10);
//     if (!isNaN(num) && num > 0) {
//       setNumQuestions(num);
//     } else {
//       alert("Please enter a valid number of questions.");
//     }
//   };

//   const handleSetTimeInterval = (value: string) => {
//     const interval = parseInt(value, 10);
//     if (!isNaN(interval) && interval > 0) {
//       setTimeInterval(interval);
//     //   setStep(3);
//     } else {
//       alert("Please enter a valid time interval.");
//     }
//   };

//   const handleSaveQuestions = () => {
//     if (questions.length === numQuestions) {
//       alert("Assignment submitted successfully.");
//     } else {
//       alert("Please fill all the questions before submitting.");
//     }
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10">
//       <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
//         <h1 className="text-2xl font-bold text-center mb-5">Abacus Assignment</h1>
//         {step === 1 && (
//           <div className="mb-5">
//             <label className="block mb-2 text-sm font-medium">Number of Questions</label>
//             <input
//               type="number"
//               min="1"
//               onChange={(e) => handleSetNumQuestions(e.target.value)}
//               className="border px-3 py-2 rounded-md w-full"
//             />
//             <button
//               onClick={() => setStep(2)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Set
//             </button>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="mb-5">
//             <label className="block mb-2 text-sm font-medium">Time Interval (seconds)</label>
//             <input
//               type="number"
//               min="1"
//               onChange={(e) => handleSetTimeInterval(e.target.value)}
//               className="border px-3 py-2 rounded-md w-full"
//             />
//             <button
//               onClick={() => setStep(3)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Set
//             </button>
//           </div>
//         )}

//         {step === 3 && (
//           <div>
//             {Array.from({ length: numQuestions || 0 }).map((_, index) => (
//               <div key={index} className="mb-4">
//                 <h4 className="text-lg font-semibold">Question {index + 1}</h4>
//                 <input
//                   type="text"
//                   id="quesion"
//                   placeholder="Enter question"
//                   onBlur={(e) => {
//                     const newQuestions = [...questions];
//                     newQuestions[index] = e.target.value;
//                     setQuestions(newQuestions);
//                   }}
//                   className="border px-3 py-2 rounded-md w-full"
//                 />
//               </div>
//             ))}
//             <button
//               onClick={handleSaveQuestions}
//               className="bg-green-500 text-white px-4 py-2 rounded-md mt-3"
//             >
//               Save Questions
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Abacusnew;
