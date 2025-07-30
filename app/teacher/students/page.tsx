'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import dayjs from 'dayjs'

export default function TeacherStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user?.id) {
        console.error('No logged-in teacher.')
        setLoading(false)
        return
      }

      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('subject')
        .eq('user_id', user.id)
        .single()

      if (teacherError || !teacher?.subject) {
        console.error('Teacher subject not found.')
        setLoading(false)
        return
      }

      const { data: matchedStudents, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('subject', teacher.subject)

      if (studentError) {
        console.error('Error fetching students:', studentError.message)
      }

      setStudents(matchedStudents || [])
      setLoading(false)
    }

    fetchStudents()
  }, [])

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-6">👨‍🎓 My Students</h1>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students found for your subject.</p>
      ) : (
        <ul className="space-y-4">
          {students.map((s) => (
            <li
              key={s.id}
              className="bg-white shadow p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="text-lg font-semibold">{s.firstname}</div>
                <div className="text-gray-600">
                  <strong>Username:</strong> {s.username || 'Not Assigned'}
                </div>
                <div className="text-gray-600">
                  <strong>Joining Month:</strong>{' '}
                  {dayjs(s.created_at).format('MMMM YYYY')}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(s)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View More
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Student Details</h2>
            <div><strong>Username:</strong> {selectedStudent.username || 'Not Assigned'}</div>
            <div><strong>Name:</strong> {selectedStudent.firstname}</div>
            <div><strong>Email:</strong> {selectedStudent.email}</div>
            <div><strong>Subject:</strong> {selectedStudent.subject}</div>
            <div><strong>Contact:</strong> {selectedStudent.contact}</div>
            <div><strong>Address:</strong> {selectedStudent.address}</div>
            <div><strong>Joining Date:</strong> {dayjs(selectedStudent.created_at).format('DD MMM YYYY')}</div>
            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
