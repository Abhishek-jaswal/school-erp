"use client";

import { useUserStore } from "@/store/useUserStore";

export default function SubjectStudents() {
  const userId = useUserStore((s) => s.userId);
  const teacher = useUserStore((s) =>
    s.teachers.find((t) => t.id === userId)
  );

  const students = useUserStore((s) =>
    s.students.filter((stu) => stu.subject === teacher?.subject)
  );

  if (!teacher) return <p className="text-red-600">Teacher not found.</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">My Students ({teacher.subject})</h2>
      {students.length === 0 ? (
        <p className="text-gray-500">No students found for your subject.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {students.map((stu) => (
            <li
              key={stu.id}
              className="p-3 bg-gray-50 border rounded shadow-sm"
            >
              <p><strong>{stu.firstName} {stu.lastName}</strong></p>
              <p>{stu.email} • {stu.contact}</p>
              <p>Address: {stu.address}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
