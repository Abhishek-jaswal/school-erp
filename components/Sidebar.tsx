// components/Sidebar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  role: 'admin' | 'teacher' | 'student'
}

export default function Sidebar({ role }: SidebarProps) {
  let links: { name: string; path: string }[] = []

  if (role === 'admin') {
    links = [
      { name: 'Profile', path: '/admin/profile' },
      { name: 'Students', path: '/admin/students' },
      { name: 'Add Exam', path: '/admin/add-exam' },
      { name: "Today's Topic", path: '/admin/todays-topic' },
      { name: 'Issues', path: '/admin/issues' },
      { name: 'Add Notification', path: '/admin/notification' },
      { name: 'Logout', path: '/logout' }
    ]
  } else if (role === 'teacher') {
    links = [
      { name: 'Profile', path: '/teacher/profile' },
      { name: 'Students', path: '/teacher/students' },
      { name: 'Add Exam', path: '/teacher/add-exam' },
      { name: "Today's Topic", path: '/teacher/todays-topic' },
      { name: 'Add Syllabus', path: '/teacher/syllabus' },
      { name: 'Issue', path: '/teacher/issue' },
      { name: 'Logout', path: '/logout' }
    ]
  } else {
    links = [
      { name: 'Profile', path: '/student/profile' },
      { name: 'Syllabus', path: '/student/syllabus' },
      { name: 'Exams', path: '/student/exams' },
      { name: 'Issue', path: '/student/issue' },
      { name: 'Logout', path: '/logout' }
    ]
  }

  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-gray-100 p-6 shadow-md">
      <nav className="flex flex-col gap-4">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.path}
            className={`text-lg hover:text-blue-600 ${
              pathname === link.path ? 'text-blue-600 font-semibold' : 'text-gray-700'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
