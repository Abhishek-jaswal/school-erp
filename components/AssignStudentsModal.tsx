'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AssignStudentsModal({ exam, onClose }: any) {
  const [list, setList] = useState<any[]>([])
  const [sel, setSel] = useState<string[]>([])

  useEffect(()=> { supabase.from('students').select('*').then(r=>setList(r.data||[])); }, [])

  const assign = async () => {
    await supabase.from('exam_assignments').insert(sel.map(sid=>({exam_id: exam.id, student_id: sid})))
    alert('Assigned'); onClose()
  }

  return (
    <div className="modal">
      {list.map(s=>(
        <label key={s.id}><input type="checkbox" checked={sel.includes(s.id)} onChange={()=>setSel(sel.includes(s.id)?sel.filter(i=>i!==s.id):[...sel,s.id])} />{s.name}</label>
      ))}
      <button onClick={assign}>Assign</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
