'use client';

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  subject: string;
  email: string;
};

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    axios.get("/teacher/students").then((res) => setStudents(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Students (Your Subject)</h2>
      <table className="w-full border table-auto bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th>ID</th><th>Name</th><th>Email</th><th>Subject</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b">
              <td>{s.id}</td>
              <td>{s.firstName} {s.lastName}</td>
              <td>{s.email}</td>
              <td>{s.subject}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
