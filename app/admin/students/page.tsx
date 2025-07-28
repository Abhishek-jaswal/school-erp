// app/admin/students/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Student {
  id: string
  firstname: string
    lastname: string
  email: string
  subject: string
  contact: string
  address: string
  adharnumber: string
  alternatenumber: string
  education: string
  number: string
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('All')

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase.from('students').select('*')
      if (!error && data) {
        setStudents(data)
        setFilteredStudents(data)
      }
    }

    fetchStudents()
  }, [])

  // Fetch unique subjects from teachers
 useEffect(() => {
  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('subject')
      .neq('subject', null)

    const predefinedSubjects = ['Math', 'English', 'Physics', 'Chemistry', 'IT']

    if (!error && data) {
      const dynamicSubjects = [...new Set(data.map((t) => t.subject))]
      const combined = Array.from(new Set([...predefinedSubjects, ...dynamicSubjects]))
      setSubjects(combined)
    } else {
      setSubjects(predefinedSubjects)
    }
  }

  fetchSubjects()
}, [])

  // Handle filter
  useEffect(() => {
    if (selectedSubject === 'All') {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter((s) => s.subject === selectedSubject)
      setFilteredStudents(filtered)
    }
  }, [selectedSubject, students])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium">
            Total: {filteredStudents.length}
          </span>
          <select
            className="border px-3 py-2 rounded"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Aadhar Number</th>
              <th className="px-4 py-2 text-left">Alternate Number</th>
              <th className="px-4 py-2 text-left">Education</th>
              <th className="px-4 py-2 text-left">Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-t">
                <td className="px-4 py-2">{student.firstname} {student.lastname}</td>
                <td className="px-4 py-2">{student.email}</td>
                <td className="px-4 py-2">{student.subject}</td>
                <td className="px-4 py-2">{student.contact}</td>
                <td className="px-4 py-2">{student.address}</td>
                <td className="px-4 py-2">{student.adharnumber}</td>
                <td className="px-4 py-2">{student.alternatenumber}</td>
                <td className="px-4 py-2">{student.education}</td>
                <td className="px-4 py-2">{student.number}</td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center" colSpan={3}>
                  No students found for selected subject.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
