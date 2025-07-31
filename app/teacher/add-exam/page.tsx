'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import ExamTable from '@/components/ExamTable'

export default function AddExam() {
  const [form, setForm] = useState({ topic: '', date: '', duration: '', total_marks: '' })
  const [refresh, setRefresh] = useState(false)

  const handleAdd = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const { data: teacher } = await supabase.from('teachers').select('subject').eq('user_id', userData.user?.id).single()

    const { error } = await supabase.from('exams').insert({
      ...form,
      subject: teacher?.subject,
      teacher_id: userData.user?.id,
    })

    if (!error) {
      alert('✅ Exam Added')
      setForm({ topic: '', date: '', duration: '', total_marks: '' })
      setRefresh(!refresh)
    }
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">➕ Add Exam</h1>
      <div className="space-y-4 max-w-md">
        <input className="input" placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className="input" placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <input type="number" className="input" placeholder="Total Marks" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
        <button onClick={handleAdd} className="btn">Submit</button>
      </div>

      <div className="mt-10">
        <ExamTable refresh={refresh} />
      </div>
    </div>
  )
}
