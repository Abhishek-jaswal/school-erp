'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ViewExamModal({ exam, onClose }: any) {
  const [questions, setQuestions] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    const fetchDetails = async () => {
      const { data: q } = await supabase.from('questions').select('*').eq('exam_id', exam.id)
      const { data: s } = await supabase
        .from('exam_assignments')
        .select('*, student:students(*)')
        .eq('exam_id', exam.id)
      setQuestions(q || [])
      setStudents(s?.map((r: any) => r.student) || [])
    }

    fetchDetails()
  }, [])

  return (
    <div className="modal">
      <div className="modal-content max-h-[80vh] overflow-y-auto">
        <h2 className="font-bold text-xl mb-2">👁️ Exam: {exam.topic}</h2>
        <p><strong>Date:</strong> {exam.date}</p>
        <p><strong>Duration:</strong> {exam.duration}</p>
        <p><strong>Total Marks:</strong> {exam.total_marks}</p>

        <hr className="my-3" />

        <h3 className="font-semibold">📄 Questions</h3>
        <ul className="list-disc ml-4">
          {questions.map((q, i) => (
            <li key={q.id}>{q.question}</li>
          ))}
        </ul>

        <h3 className="font-semibold mt-4">👥 Assigned Students</h3>
        <ul className="list-disc ml-4">
          {students.map((s, i) => (
            <li key={s.id}>{s.name} ({s.email})</li>
          ))}
        </ul>

        <button className="btn-outline mt-4" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
