'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AssignStudentsModal({ exam, onClose }: any) {
  const [students, setStudents] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase.from('students').select('*')
      setStudents(data || [])
    }
    fetchStudents()
  }, [])

  const assign = async () => {
    const insertData = selected.map((student_id) => ({
      exam_id: exam.id,
      student_id,
    }))
    await supabase.from('exam_assignments').insert(insertData)
    onClose()
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="font-bold mb-2">👤 Assign Students to {exam.topic}</h2>
        <div className="max-h-60 overflow-auto space-y-2">
          {students.map((s) => (
            <label key={s.id} className="block">
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => {
                  if (selected.includes(s.id)) setSelected(selected.filter((id) => id !== s.id))
                  else setSelected([...selected, s.id])
                }}
              />{' '}
              {s.name} ({s.email})
            </label>
          ))}
        </div>
        <button className="btn mt-4" onClick={assign}>Assign</button>
        <button className="btn-outline mt-2" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
