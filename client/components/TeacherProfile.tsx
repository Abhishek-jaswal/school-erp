"use client";

import { useUserStore } from "@/store/useUserStore";

export default function TeacherProfile() {
  const userId = useUserStore((s) => s.userId);
  const teacher = useUserStore((s) =>
    s.teachers.find((t) => t.id === userId)
  );

  if (!teacher) return <p className="text-red-600">Teacher not found.</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">My Profile</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <p><strong>Name:</strong> {teacher.firstName} {teacher.lastName}</p>
        <p><strong>Email:</strong> {teacher.email}</p>
        <p><strong>Contact:</strong> {teacher.contact}</p>
        <p><strong>Subject:</strong> {teacher.subject}</p>
        <p><strong>Address:</strong> {teacher.address}</p>
        <p><strong>Education:</strong> {teacher.education}</p>
      </div>
    </div>
  );
}
