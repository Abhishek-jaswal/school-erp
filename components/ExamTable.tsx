'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AddQuestionModal from './AddQuestionModal'
import AssignStudentsModal from './AssignStudentsModal'
import ViewExamModal from './ViewExamModal'

export default function ExamTable({ refresh }: { refresh: boolean }) {
  const [exams, setExams] = useState<any[]>([])
  const [selected, setSelected] = useState<{ exam: any, mode: 'view'|'questions'|'students' } | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: user } = await supabase.auth.getUser()
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user?.user?.id)
        .single()
      if (!teacher) return setExams([])
      const { data } = await supabase.from('exams').select('*').eq('teacher_id', teacher.id).order('created_at', { ascending: false })
      setExams(data || [])
    }
    load()
  }, [refresh])

  return (
    <>
      <table className="w-full table-auto border">
        <thead><tr><th>Topic</th><th>Date</th><th>Duration</th><th>Marks</th><th>Actions</th></tr></thead>
        <tbody>
          {exams.map(ex => (
            <tr key={ex.id}>
              <td>{ex.topic}</td>
              <td>{ex.date}</td>
              <td>{ex.duration}</td>
              <td>{ex.total_marks}</td>
              <td>
                <button onClick={() => setSelected({exam: ex, mode: 'questions'})}>➕ Questions</button>
                <button onClick={() => setSelected({exam: ex, mode: 'students'})}>👤 Assign</button>
                <button onClick={() => setSelected({exam: ex, mode: 'view'})}>👁️ View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected?.mode === 'questions' && <AddQuestionModal exam={selected.exam} onClose={() => setSelected(null)} />}
      {selected?.mode === 'students' && <AssignStudentsModal exam={selected.exam} onClose={() => setSelected(null)} />}
      {selected?.mode === 'view' && <ViewExamModal exam={selected.exam} onClose={() => setSelected(null)} />}
    </>
  )
}
