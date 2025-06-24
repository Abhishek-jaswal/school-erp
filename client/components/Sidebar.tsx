"use client";

import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";

interface SidebarProps {
  role: "admin" | "teacher" | "student";
}

const sidebarLinks = {
  admin: ["Profile", "Teachers", "Students", "Add Exam", "Today's Topic", "Issues", "Add Notification", "Logout"],
  teacher: ["Profile", "Students", "Add Exam", "Today's Topic", "Add Syllabus", "Issue", "Logout"],
  student: ["Profile", "Syllabus", "Exams", "Issue", "Logout"],
};

export default function Sidebar({ role }: SidebarProps) {
  const logout = useUserStore((state) => state.logout);

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4 capitalize">{role} Panel</h2>
      <nav className="flex-1">
        <ul className="space-y-2">
          {sidebarLinks[role].map((label) => (
            <li key={label}>
              {label === "Logout" ? (
                <button
                  onClick={logout}
                  className="text-red-400 hover:text-red-600 w-full text-left"
                >
                  {label}
                </button>
              ) : (
                <Link
                  href={`/${role}/${label.toLowerCase().replace(/ /g, "")}`}
                  className="block hover:text-blue-400"
                >
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
