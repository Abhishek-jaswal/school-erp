"use client"

import Sidebar from '@/components/Sidebar'
import { useEffect, useState } from 'react'
import AddTeacherModal from '@/components/AddTeacherModal'
import AddStudentModal from '@/components/AddStudentModal'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*')
    if (!error) setStudents(data || [])
  }

  const fetchTeachers = async () => {
    const { data, error } = await supabase.from('teachers').select('*')
    if (!error) setTeachers(data || [])
  }

  useEffect(() => {
    fetchStudents()
    fetchTeachers()
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="flex gap-6 mb-8">
          <button
            onClick={() => setShowTeacherModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Add Teacher
          </button>

          <button
            onClick={() => setShowStudentModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ➕ Add Student
          </button>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">👨‍🏫 Teachers</h2>
            <ul className="space-y-2">
              {teachers.map((teacher: any) => (
                <li key={teacher.id} className="border p-2 rounded shadow-sm">
                  {teacher.firstname} {teacher.lastname} - {teacher.subject}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">👨‍🎓 Students</h2>
            <ul className="space-y-2">
              {students.map((student: any) => (
                <li key={student.id} className="border p-2 rounded shadow-sm">
                  {student.firstname} {student.lastname} - {student.subject}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modals */}
        {showTeacherModal && (
          <AddTeacherModal
            onClose={() => setShowTeacherModal(false)}
            onTeacherAdded={fetchTeachers}
          />
        )}
        {showStudentModal && (
          <AddStudentModal
            onClose={() => setShowStudentModal(false)}
            onStudentAdded={fetchStudents}
          />
        )}
      </main>
    </div>
  )
}
