'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

interface SidebarProps {
  role: 'admin' | 'teacher' | 'student'
}

export default function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  let links: { name: string; path: string }[] = []

  if (role === 'admin') {
    links = [
      { name: 'Profile', path: '/admin/dashboard' },
      { name: 'Students', path: '/admin/students' },
      { name: 'Teachers', path: '/admin/teachers' },
      { name: 'Issues', path: '/admin/issues' },
            { name: "Today's Topic", path: '/admin/todays-topic' },
      { name: 'Notifications', path: '/admin/notifications' },
      { name: 'Logout', path: '/' }
    ]
  } else if (role === 'teacher') {
    links = [
      { name: 'Profile', path: '/teacher/dashboard' },
      { name: 'Students', path: '/teacher/students' },
      { name: 'Notifications', path: '/teacher/notifications' },
      { name: 'Add Exam', path: '/teacher/add-exam' },
      { name: "Today's Topic", path: '/teacher/todays-topic' },
      { name: 'Add Syllabus', path: '/teacher/syllabus' },
      { name: 'Issue', path: '/teacher/issue' },
      { name: 'Logout', path: '/' }
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

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-800 text-white flex items-center justify-between px-4 py-3 z-50">
        <span className="text-xl font-semibold">Dashboard</span>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform z-40 transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:block`}
      >
        <div className="mt-16 md:mt-6 px-4 py-4 space-y-4">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                pathname === link.path
                  ? 'bg-blue-600 font-semibold'
                  : 'text-gray-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </aside>

    
    </>
  )
}
