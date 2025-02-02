'use client';
import { useState } from "react";

export default function AbacusAssignment() {
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [timeInterval, setTimeInterval] = useState<number>(0);
  const [questions, setQuestions] = useState<string[][]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState<number>(0);

  const handleSetNumQuestions = () => {
    const numInput = document.getElementById("num-questions") as HTMLInputElement | null;
    if (!numInput) return;
    const num = parseInt(numInput.value.trim(), 10);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid number of questions.");
      return;
    }
    setNumQuestions(num);
    const questionSetup = document.getElementById("question-setup");
    if (questionSetup) questionSetup.style.display = "block";
  };

  const handleSetTimeInterval = () => {
    const timeInput = document.getElementById("time-interval") as HTMLInputElement | null;
    if (!timeInput) return;
    const time = parseInt(timeInput.value.trim(), 10);
    if (isNaN(time) || time <= 0) {
      alert("Please enter a valid time interval.");
      return;
    }
    setTimeInterval(time);
    renderQuestionInputForms();
  };

  const addSequence = (questionIndex: number): void => {
    const sequencesDiv = document.getElementById(`sequences-${questionIndex}`);
    if (!sequencesDiv) return;
  
    const newIndex = sequencesDiv.children.length;
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.id = `operation-${questionIndex}-${newIndex}`;
    newInput.placeholder = "Enter operation (e.g., *2, +5)";
    newInput.className = "border rounded px-3 py-2 w-full mt-2";
    sequencesDiv.appendChild(newInput);
  };

  const renderQuestionInputForms = () => {
    
    const questionsInput = document.getElementById("questions-input");
    if (!questionsInput) return;

    questionsInput.innerHTML = "";
    for (let i = 0; i < numQuestions; i++) {
      const questionLetter = String.fromCharCode(65 + i);
      questionsInput.innerHTML += `
        <div>
          <h4 class='text-lg font-bold'>Question ${questionLetter}</h4>
          <div id="sequences-${i}" class="space-y-2">
            <input type="text" id="operation-${i}-0" placeholder="Enter operation (e.g., *2, +5)" class="border rounded px-3 py-2 w-full" />
          </div>
          <button onclick="addSequence(${i})" class="bg-blue-500 text-white px-3 py-1 rounded">Add Sequence</button>
        </div>
      `;
    }
    questionsInput.innerHTML += `<button onclick="saveQuestions()" class="bg-green-500 text-white px-4 py-2 rounded mt-4">Save Questions</button>`;
  };

  const saveQuestions = () => {

    const newQuestions: string[][] = [];
    for (let i = 0; i < numQuestions; i++) {
      const sequencesDiv = document.getElementById(`sequences-${i}`);
      if (!sequencesDiv) continue;
      const sequenceInputs = sequencesDiv.querySelectorAll("input");
      const sequences: string[] = [];

      for (const input of sequenceInputs) {
        const value = (input as HTMLInputElement).value.trim();

        if (value.match(/^\d+(\.\d+)?$/)) {
          sequences.push(`+${value}`);
        } else if (value.match(/^[+\-*/]\d+(\.\d+)?$/)) {
          sequences.push(value);
        } else {
          alert(`Invalid input for Question ${String.fromCharCode(65 + i)}. Ensure proper format.`);
          return;
        }
      }

      if (sequences.length === 0) {
        alert(`Please enter at least one sequence for Question ${String.fromCharCode(65 + i)}.`);
        return;
      }

      newQuestions.push(sequences);
    }
    setQuestions(newQuestions);
    const startButton = document.getElementById("start-btn");
    if (startButton) startButton.style.display = "block";
  };

  const startAssignment = () => {
    const setupDiv = document.getElementById("setup");
    const assignmentDiv = document.getElementById("assignment");
    if (setupDiv) setupDiv.style.display = "none";
    if (assignmentDiv) assignmentDiv.style.display = "block";
    showQuestion(0);
  };

  const showQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentQuestionIndex(index);
    setCurrentSequenceIndex(0);
    displaySequence(questions[index], String.fromCharCode(65 + index));
  };

  const displaySequence = (sequences: string[], questionLetter: string) => {
    const questionBox = document.getElementById("question-box");
    if (!questionBox) return;

    if (currentSequenceIndex < sequences.length) {
      questionBox.innerHTML = `${questionLetter}<br>&nbsp;`;
      setTimeout(() => {
        questionBox.innerHTML = `${questionLetter}<br>${sequences[currentSequenceIndex]}`;
        setCurrentSequenceIndex((prev) => prev + 1);
      }, timeInterval * 1000);
    } else {
      questionBox.innerHTML = `${questionLetter}<br>END`;
    }
  };

  const showAnswer = () => {
    const sequences = questions[currentQuestionIndex];
    let result = 0;
    try {
      sequences.forEach((operation) => {
        const operator = operation[0];
        const value = parseFloat(operation.slice(1));

        switch (operator) {
          case "+":
            result += value;
            break;
          case "-":
            result -= value;
            break;
          case "*":
            result *= value;
            break;
          case "/":
            result /= value;
            break;
          default:
            throw new Error("Invalid operator.");
        }
      });
      document.getElementById("answer-box")!.textContent = `Answer: ${result}`;
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="bg-gray-100 p-6 flex flex-col items-center min-h-screen">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Abacus Assignment</h1>
        
        {/* Setup Section */}
        <div id="setup" className="space-y-4">
          <NumberOfQuestionsInput handleSetNumQuestions={handleSetNumQuestions} />
          <QuestionSetupSection handleSetTimeInterval={handleSetTimeInterval} />
        </div>

        {/* Assignment Section */}
        <div id="assignment" className="hidden">
          <h2 className="text-xl font-bold mb-4">Assignment</h2>
          <div id="question-box" className="text-center text-7xl font-bold text-gray-700 mb-4"></div>
          <div id="answer-box" className="text-center text-7xl font-bold text-green-700 mb-4"></div>
          <div className="flex justify-around">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={showAnswer}>Show Answer</button>
            <button className="bg-gray-300 px-4 py-2 rounded">Repeat</button>
            <button className="bg-gray-300 px-4 py-2 rounded">Previous</button>
            <button className="bg-gray-300 px-4 py-2 rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Number of Questions Input Component
const NumberOfQuestionsInput = ({ handleSetNumQuestions }: { handleSetNumQuestions: () => void }) => (
  <div>
    <label className="block text-sm font-medium">Number of Questions:</label>
    <input
      type="number"
      id="num-questions"
      className="border rounded w-full p-2 mt-1"
      placeholder="Enter number of questions"
    />
    <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={handleSetNumQuestions}>
      Set
    </button>
  </div>
);

// Question Setup Section Component
const QuestionSetupSection = ({ handleSetTimeInterval }: { handleSetTimeInterval: () => void }) => (
  <div id="question-setup" className="hidden space-y-4">
    <div>
      <label className="block text-sm font-medium">Time Interval (seconds):</label>
      <input
        type="number"
        id="time-interval"
        className="border rounded w-full p-2 mt-1"
        placeholder="Enter time interval"
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={handleSetTimeInterval}>
        Set
      </button>
    </div>
    <div id="questions-input"></div>
    <button id="start-btn" className="hidden bg-green-500 text-white px-4 py-2 rounded mt-4">
      Start Assignment
    </button>
  </div>
);


// 'use client';
// import { useState } from "react";

// export default function AbacusAssignment() {
//   const [numQuestions, setNumQuestions] = useState<number>(0);
//   const [timeInterval, setTimeInterval] = useState<number>(0);
//   const [questions, setQuestions] = useState<string[][]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
//   const [currentSequenceIndex, setCurrentSequenceIndex] = useState<number>(0);

//   const handleSetNumQuestions = () => {
//     const numInput = document.getElementById("num-questions") as HTMLInputElement | null;
//     if (!numInput) return;
//     const num = parseInt(numInput.value.trim(), 10);
//     if (isNaN(num) || num <= 0) {
//       alert("Please enter a valid number of questions.");
//       return;
//     }
//     setNumQuestions(num);
//     const questionSetup = document.getElementById("question-setup");
//     if (questionSetup) questionSetup.style.display = "block";
//   };

//   const handleSetTimeInterval = () => {
//     const timeInput = document.getElementById("time-interval") as HTMLInputElement | null;
//     if (!timeInput) return;
//     const time = parseInt(timeInput.value.trim(), 10);
//     if (isNaN(time) || time <= 0) {
//       alert("Please enter a valid time interval.");
//       return;
//     }
//     setTimeInterval(time);
//     renderQuestionInputForms();
//   };

//   const addSequence = (questionIndex: number): void => {
//     const sequencesDiv = document.getElementById(`sequences-${questionIndex}`);
//     if (!sequencesDiv) return;
  
//     const newIndex = sequencesDiv.children.length;
//     const newInput = document.createElement("input");
//     newInput.type = "text";
//     newInput.id = `operation-${questionIndex}-${newIndex}`;
//     newInput.placeholder = "Enter operation (e.g., *2, +5)";
//     newInput.className = "border rounded px-3 py-2 w-full mt-2";
//     sequencesDiv.appendChild(newInput);
//   };

//   const renderQuestionInputForms = () => {
//     const questionsInput = document.getElementById("questions-input");
//     if (!questionsInput) return;

//     questionsInput.innerHTML = "";
//     for (let i = 0; i < numQuestions; i++) {
//       const questionLetter = String.fromCharCode(65 + i);
//       questionsInput.innerHTML += `
//         <div>
//           <h4 class='text-lg font-bold'>Question ${questionLetter}</h4>
//           <div id="sequences-${i}" class="space-y-2">
//             <input type="text" id="operation-${i}-0" placeholder="Enter operation (e.g., *2, +5)" class="border rounded px-3 py-2 w-full" />
//           </div>
//           <button onclick="addSequence(${i})" class="bg-blue-500 text-white px-3 py-1 rounded">Add Sequence</button>
//         </div>
//       `;
//     }
//     questionsInput.innerHTML += `<button onclick="saveQuestions()" class="bg-green-500 text-white px-4 py-2 rounded mt-4">Save Questions</button>`;
//   };

//   const saveQuestions = () => {
//     const newQuestions: string[][] = [];
//     for (let i = 0; i < numQuestions; i++) {
//       const sequencesDiv = document.getElementById(`sequences-${i}`);
//       if (!sequencesDiv) continue;
//       const sequenceInputs = sequencesDiv.querySelectorAll("input");
//       const sequences: string[] = [];

//       for (const input of sequenceInputs) {
//         const value = (input as HTMLInputElement).value.trim();

//         if (value.match(/^\d+(\.\d+)?$/)) {
//           sequences.push(`+${value}`);
//         } else if (value.match(/^[+\-*/]\d+(\.\d+)?$/)) {
//           sequences.push(value);
//         } else {
//           alert(`Invalid input for Question ${String.fromCharCode(65 + i)}. Ensure proper format.`);
//           return;
//         }
//       }

//       if (sequences.length === 0) {
//         alert(`Please enter at least one sequence for Question ${String.fromCharCode(65 + i)}.`);
//         return;
//       }

//       newQuestions.push(sequences);
//     }
//     setQuestions(newQuestions);
//     const startButton = document.getElementById("start-btn");
//     if (startButton) startButton.style.display = "block";
//   };

//   const startAssignment = () => {
//     const setupDiv = document.getElementById("setup");
//     const assignmentDiv = document.getElementById("assignment");
//     if (setupDiv) setupDiv.style.display = "none";
//     if (assignmentDiv) assignmentDiv.style.display = "block";
//     showQuestion(0);
//   };

//   const showQuestion = (index: number) => {
//     if (index < 0 || index >= questions.length) return;
//     setCurrentQuestionIndex(index);
//     setCurrentSequenceIndex(0);
//     displaySequence(questions[index], String.fromCharCode(65 + index));
//   };

//   const displaySequence = (sequences: string[], questionLetter: string) => {
//     const questionBox = document.getElementById("question-box");
//     if (!questionBox) return;

//     if (currentSequenceIndex < sequences.length) {
//       questionBox.innerHTML = `${questionLetter}<br>&nbsp;`;
//       setTimeout(() => {
//         questionBox.innerHTML = `${questionLetter}<br>${sequences[currentSequenceIndex]}`;
//         setCurrentSequenceIndex((prev) => prev + 1);
//       }, timeInterval * 1000);
//     } else {
//       questionBox.innerHTML = `${questionLetter}<br>END`;
//     }
//   };

//   const showAnswer = () => {
//     const sequences = questions[currentQuestionIndex];
//     let result = 0;

//     try {
//       sequences.forEach((operation) => {
//         const operator = operation[0];
//         const value = parseFloat(operation.slice(1));

//         switch (operator) {
//           case "+":
//             result += value;
//             break;
//           case "-":
//             result -= value;
//             break;
//           case "*":
//             result *= value;
//             break;
//           case "/":
//             result /= value;
//             break;
//           default:
//             throw new Error("Invalid operator.");
//         }
//       });
//       document.getElementById("answer-box")!.textContent = `Answer: ${result}`;
//     } catch (err) {
//       alert(`Error: ${(err as Error).message}`);
//     }
//   };

//   return (
//     <div className="bg-gray-100 p-6 flex flex-col items-center min-h-screen">
//       <div className="bg-white p-6 rounded shadow-md max-w-lg w-full">
//         <h1 className="text-2xl font-bold text-center mb-6">Abacus Assignment</h1>

//         <div id="setup" className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Number of Questions:</label>
//             <input
//               type="number"
//               id="num-questions"
//               className="border rounded w-full p-2 mt-1"
//               placeholder="Enter number of questions"
//             />
//             <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={handleSetNumQuestions}>
//               Set
//             </button>
//           </div>

//           <div id="question-setup" className="hidden space-y-4">
//             <div>
//               <label className="block text-sm font-medium">Time Interval (seconds):</label>
//               <input
//                 type="number"
//                 id="time-interval"
//                 className="border rounded w-full p-2 mt-1"
//                 placeholder="Enter time interval"
//               />
//               <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={handleSetTimeInterval}>
//                 Set
//               </button>
//             </div>
//             <div id="questions-input"></div>
//             <button id="start-btn" className="hidden bg-green-500 text-white px-4 py-2 rounded mt-4" onClick={startAssignment}>
//               Start Assignment
//             </button>
//           </div>
//         </div>

//         <div id="assignment" className="hidden">
//           <h2 className="text-xl font-bold mb-4">Assignment</h2>
//           <div id="question-box" className="text-center text-7xl font-bold text-gray-700 mb-4"></div>
//           <div id="answer-box" className="text-center text-7xl font-bold text-green-700 mb-4"></div>
//           <div className="flex justify-around">
//             <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={showAnswer}>
//               Show Answer
//             </button>
//             <button className="bg-gray-300 px-4 py-2 rounded">Repeat</button>
//             <button className="bg-gray-300 px-4 py-2 rounded">Previous</button>
//             <button className="bg-gray-300 px-4 py-2 rounded">Next</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }










