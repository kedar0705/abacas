'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, getDocs, deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type Assignment = {
  id: string;
  createdAt: string;
  timeInterval: number;
  numQuestions: number;
  sequence: { questionNumber: number; question: string }[];
};

const Abacus2 = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Assignment'));
        const assignmentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          createdAt: doc.data().createdAt.toDate().toLocaleDateString(),
          timeInterval: doc.data().timeInterval,
          numQuestions: doc.data().numQuestions,
          sequence: doc.data().sequence,
        }));
        setAssignments(assignmentsList);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleStartAssignment = (assignment: Assignment) => {
    const query = new URLSearchParams({
      id: assignment.id,
      // timeInterval: `${assignment.timeInterval}`, // Template literal to ensure string conversion
    }).toString();
  
    router.push(`/sequence?${query}`);
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'Assignment', id));
      setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
      alert('Assignment deleted successfully.');
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const handleAddAssignment = async () => {
    try {
      // Query the collection to get the last document based on the numeric ID
      const querySnapshot = await getDocs(collection(db, 'Assignment'));
      const assignmentIds = querySnapshot.docs.map((doc) => doc.id);
  
      // Find the document with the highest numeric suffix
      let nextId = '';
      if (assignmentIds.length > 0) {
        const numericIds = assignmentIds
          .map((id) => parseInt(id.split('-')[1], 10)) // Extract numeric part
          .filter((num) => !isNaN(num)); // Filter valid numbers
        const maxId = Math.max(...numericIds); // Get the maximum numeric value
        nextId = `Assignment-${maxId + 1}`; // Increment the maximum numeric value
      } else {
        nextId = 'Assignment-1'; // Default for the first document
      }
  
      // Create a new document in Firestore
      const newAssignment = {
        createdAt: Timestamp.now(), // Current date and time
        timeInterval: 0,
        numberOfQuestion: 0,
        sequence: [],
      };
  
      await setDoc(doc(db, 'Assignment', nextId), newAssignment);
  
      // Redirect to the new-assignment page with the new document ID
      router.push(`/create-assignment?id=${nextId}`);
    } catch (error) {
      console.error('Error adding new assignment:', error);
    }
  };
  

  return (
    <div>
      <h1 className='text-8xl font-extrabold text-center mt-10 '>Abacus</h1>
      <div className="mx-auto mt-28 border-black border-[1px] w-fit h-fit p-3 rounded-md mb-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          assignments.map((assignment) => (
            <div
              className="text border-black border-[1px] w-[800px] h-[100px] flex p-4 rounded-md mb-2"
              key={assignment.id}
            >
              <div>
                <h1 className="text-2xl font-bold w-[175px]">{assignment.id}</h1>
                <p>{assignment.createdAt}</p>
              </div>
              <div className="relative flex left-[430px]">
                <div>
                  <button
                    onClick={() => handleStartAssignment(assignment)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-3 -mr-8"
                  >
                    Start
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mt-3 ml-14"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="flex m-3 justify-end">
          <p className="font-bold mt-2 mr-3">Create a new Assignment</p>
          <button
            onClick={handleAddAssignment}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Abacus2;