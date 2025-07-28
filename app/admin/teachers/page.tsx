'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AddTeacherModal from '@/components/AddTeacherModal'
import Sidebar from '@/components/Sidebar'

interface Teacher {
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

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('All')
  const [showTeacherModal, setShowTeacherModal] = useState(false)

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase.from('teachers').select('*')
      if (!error && data) {
        setTeachers(data)
        setFilteredTeachers(data)
      }
    }

    fetchTeachers()
  }, [])

  // Predefined subjects
  useEffect(() => {
    const predefinedSubjects = ['Math', 'English', 'Physics', 'Chemistry', 'IT']
    setSubjects(predefinedSubjects)
  }, [])

  // Filter by subject
  useEffect(() => {
    if (selectedSubject === 'All') {
      setFilteredTeachers(teachers)
    } else {
      const filtered = teachers.filter((t) => t.subject === selectedSubject)
      setFilteredTeachers(filtered)
    }
  }, [selectedSubject, teachers])

  const fetchTeachers = async () => {
    const { data, error } = await supabase.from('teachers').select('*')
    if (!error) setTeachers(data || [])
  }

  return (
    <div className="flex min-h-screen ">
      <Sidebar role="admin" />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-200">Teachers</h1>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-lg font-medium text-gray-200">
              Total: {filteredTeachers.length}
            </span>
            <select
              className="border px-3 py-2 rounded text-sm"
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
            <button
              onClick={() => setShowTeacherModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              ➕ Add Teacher
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow">
           <table className="min-w-full bg-gray-800 text-sm text-gray-200">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Address</th>
                <th className="px-4 py-2 text-left">Aadhar</th>
                <th className="px-4 py-2 text-left">Alternate</th>
                <th className="px-4 py-2 text-left">Education</th>
                <th className="px-4 py-2 text-left">Number</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-200">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="border-t">
                    <td className="px-4 py-2">{teacher.firstname} {teacher.lastname}</td>
                    <td className="px-4 py-2">{teacher.email}</td>
                    <td className="px-4 py-2">{teacher.subject}</td>
                    <td className="px-4 py-2">{teacher.contact}</td>
                    <td className="px-4 py-2">{teacher.address}</td>
                    <td className="px-4 py-2">{teacher.adharnumber}</td>
                    <td className="px-4 py-2">{teacher.alternatenumber}</td>
                    <td className="px-4 py-2">{teacher.education}</td>
                    <td className="px-4 py-2">{teacher.number}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-4 text-center" colSpan={9}>
                    No teachers found for selected subject.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showTeacherModal && (
          <AddTeacherModal
            onClose={() => setShowTeacherModal(false)}
            onTeacherAdded={fetchTeachers}
          />
        )}
      </div>
    </div>
  )
}
