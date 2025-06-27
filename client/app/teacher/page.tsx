"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TeacherProfile from "@/components/TeacherProfile";
import SubjectStudents from "@/components/SubjectStudents";

export default function TeacherDashboard() {
  const [tab, setTab] = useState<
    "profile" | "students" | "exam" | "topic" | "syllabus" | "issue"
  >("profile");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="teacher" onSelect={setTab} />
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>

        {tab === "profile" && <TeacherProfile />}
        {tab === "students" && <SubjectStudents />}
        {tab === "exam" && <div>📚 Exam Form Coming Soon</div>}
        {tab === "topic" && <div>📝 Add Today’s Topic Coming Soon</div>}
        {tab === "syllabus" && <div>📖 Upload Syllabus Coming Soon</div>}
        {tab === "issue" && <div>❗ Issue Form Coming Soon</div>}
      </main>
    </div>
  );
}
