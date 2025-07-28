'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AddStudentModal from '@/components/AddStudentModal'
import Sidebar from '@/components/Sidebar'

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
  const [showStudentModal, setShowStudentModal] = useState(false)

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

  // Fetch subjects from teachers
 // Predefined subjects
  useEffect(() => {
    const predefinedSubjects = ['Math', 'English', 'Physics', 'Chemistry', 'IT']
    setSubjects(predefinedSubjects)
  }, [])

  // Filter by subject
  useEffect(() => {
    if (selectedSubject === 'All') {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter((s) => s.subject === selectedSubject)
      setFilteredStudents(filtered)
    }
  }, [selectedSubject, students])

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*')
    if (!error) setStudents(data || [])
  }

  return (
    <div className="flex min-h-screen ">
      <Sidebar role="admin" />

      <div className="flex-1 p-6 space-y-6 bg-gray-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-200">Students</h1>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-lg font-medium text-gray-200">
              Total: {filteredStudents.length}
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
              onClick={() => setShowStudentModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              ➕ Add Student
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
                  <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                    No students found for selected subject.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showStudentModal && (
          <AddStudentModal
            onClose={() => setShowStudentModal(false)}
            onStudentAdded={fetchStudents}
          />
        )}
      </div>
    </div>
  )
}
