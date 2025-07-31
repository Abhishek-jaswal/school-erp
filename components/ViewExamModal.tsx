'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ViewExamModal({ exam, onClose }: any) {
  const [qs, setQs] = useState<any[]>([])
  const [ass, setAss] = useState<any[]>([])

  useEffect(() => {
    supabase.from('questions').select('*').eq('exam_id', exam.id).then(r=>setQs(r.data||[]))
    supabase.from('exam_assignments').select('student_id,student:students(*)').eq('exam_id', exam.id).then(r=>setAss(r.data||[]))
  }, [])

  return (
    <div className="modal">
      <h2>{exam.topic}</h2>
      <h3>Questions:</h3>
      <ul>{qs.map(q=><li key={q.id}>{q.question_text}</li>)}</ul>
      <h3>Students:</h3>
      <ul>{ass.map((a,i)=><li key={i}>{a.student.name}</li>)}</ul>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
