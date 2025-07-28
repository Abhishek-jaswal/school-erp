// app/teacher/layout.tsx
import Sidebar from "@/components/Sidebar";
import "@/app/globals.css";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="teacher" />
      <main className="flex-1 mt-14 md:mt-0 p-4 md:ml-64">{children}</main>
    </div>
  );
}
