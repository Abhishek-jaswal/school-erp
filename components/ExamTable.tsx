'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AssignStudentsModal from './AssignStudentsModal'
import AddQuestionsModal from './AddQuestionModal'
import ViewExamModal from './ViewExamModal'

export default function ExamTable({ refresh }: { refresh: boolean }) {
  const [exams, setExams] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [mode, setMode] = useState<'questions' | 'students' | 'view' | null>(null)

  useEffect(() => {
    const fetchExams = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const { data } = await supabase.from('exams').select('*').eq('teacher_id', userData.user?.id).order('date', { ascending: false })
      setExams(data || [])
    }
    fetchExams()
  }, [refresh])

  const openModal = (exam: any, type: 'questions' | 'students' | 'view') => {
    setSelectedExam(exam)
    setMode(type)
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📚 Exams</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Topic</th>
            <th className="p-2">Date</th>
            <th className="p-2">Duration</th>
            <th className="p-2">Marks</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id} className="border-t">
              <td className="p-2">{exam.topic}</td>
              <td className="p-2">{exam.date}</td>
              <td className="p-2">{exam.duration}</td>
              <td className="p-2">{exam.total_marks}</td>
              <td className="p-2 space-x-2">
                <button className="btn-sm" onClick={() => openModal(exam, 'questions')}>➕ Add Qs</button>
                <button className="btn-sm" onClick={() => openModal(exam, 'students')}>👤 Assign</button>
                <button className="btn-sm" onClick={() => openModal(exam, 'view')}>👁️ View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mode === 'questions' && selectedExam && <AddQuestionsModal exam={selectedExam} onClose={() => setMode(null)} />}
      {mode === 'students' && selectedExam && <AssignStudentsModal exam={selectedExam} onClose={() => setMode(null)} />}
      {mode === 'view' && selectedExam && <ViewExamModal exam={selectedExam} onClose={() => setMode(null)} />}
    </div>
  )
}
