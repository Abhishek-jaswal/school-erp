import Link from "next/link";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-green-800 text-white p-4 space-y-4">
        <h1 className="text-2xl font-bold">Teacher Panel</h1>
        <nav className="space-y-2">
          <Link href="/teacher/students" className="block hover:underline">Students</Link>
          <Link href="/teacher/exams" className="block hover:underline">Add Exam</Link>
          <Link href="/teacher/syllabus" className="block hover:underline">Upload Syllabus</Link>
          <Link href="/teacher/topics" className="block hover:underline">Today's Topic</Link>
          <Link href="/teacher/issues" className="block hover:underline">Raise Issue</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
