'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddExam() {
  const [examName, setExamName] = useState('')
  const [date, setDate] = useState('')
  const [subject, setSubject] = useState('')
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserData(data)
    }

    getUser()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!userData?.user) return alert('Not logged in.')

    // Fetch teacher ID and subject
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, subject')
      .eq('user_id', userData.user.id)
      .single()

    if (!teacher) return alert('Teacher not found.')

    const { error } = await supabase.from('exams').insert([
      {
        exam_name: examName,
        date,
        subject: teacher.subject,
        teacher_id: teacher.id,
      },
    ])

    if (error) {
      console.error(error)
      alert('Error adding exam')
    } else {
      alert('Exam added successfully')
      setExamName('')
      setDate('')
      setSubject('')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Exam</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Exam Name"
          className="w-full p-2 border rounded"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Exam
        </button>
      </form>
    </div>
  )
}
