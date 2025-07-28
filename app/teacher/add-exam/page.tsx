'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddExam() {
  const [form, setForm] = useState({ date: '', duration: '', total_marks: '' })

  const handleAdd = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const { data: teacher } = await supabase
      .from('teachers')
      .select('subject')
      .eq('user_id', userData.user?.id)
      .single()

    await supabase.from('exams').insert({
      ...form,
      subject: teacher?.subject,
      teacher_id: userData.user?.id,
    })
    alert('✅ Exam Added')
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">📝 Add Exam</h1>
      <div className="space-y-4 max-w-md">
        <input type="date" placeholder="Date" className="input" onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input type="text" placeholder="Duration" className="input" onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <input type="number" placeholder="Total Marks" className="input" onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </div>
    </div>
  )
}
