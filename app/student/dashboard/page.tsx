'use client';

import { useEffect, useState } from 'react';

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'student') {
      window.location.href = '/login'; // redirect if not student
    }

    const studentData = localStorage.getItem('user');
    if (studentData) {
      try {
        setStudent(JSON.parse(studentData));
      } catch {
        console.error('Invalid student data');
      }
    }
  }, []);

  return (
    <div className="p-6">
      {student ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Welcome, {student.name}</h1>
          <p><strong>Class:</strong> {student.class}</p>
          <p><strong>Roll No:</strong> {student.roll}</p>
          <p><strong>Email:</strong> {student.email}</p>
        </>
      ) : (
        <h1>Loading or not logged in...</h1>
      )}
    </div>
  );
}
