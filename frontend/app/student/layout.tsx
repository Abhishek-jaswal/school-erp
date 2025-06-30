import Link from "next/link";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-blue-800 text-white p-4 space-y-4">
        <h1 className="text-2xl font-bold">Student Panel</h1>
        <nav className="space-y-2">
          <Link href="/student/syllabus" className="block hover:underline">Syllabus</Link>
          <Link href="/student/exams" className="block hover:underline">Exams</Link>
          <Link href="/student/issues" className="block hover:underline">Raise Issue</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
