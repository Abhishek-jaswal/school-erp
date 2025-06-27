"use client";


interface SidebarProps {
  role: "admin" | "teacher" | "student";
  onSelect?: (tab: any) => void;
}

export default function Sidebar({ role, onSelect }: SidebarProps) {
  const handleSelect = (tab: any) => onSelect?.(tab);

  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 font-bold text-lg border-b">School ERP</div>
      <nav className="flex flex-col p-4 space-y-2 text-sm">
        {role === "teacher" && (
          <>
            <button onClick={() => handleSelect("profile")}>Profile</button>
            <button onClick={() => handleSelect("students")}>Students</button>
            <button onClick={() => handleSelect("exam")}>Add Exam</button>
            <button onClick={() => handleSelect("topic")}>Today’s Topic</button>
            <button onClick={() => handleSelect("syllabus")}>Add Syllabus</button>
            <button onClick={() => handleSelect("issue")}>Issue</button>
            <button onClick={() => location.href = "/login"}>Logout</button>
          </>
        )}
        {/* other role buttons... */}
      </nav>
    </aside>
  );
}
