'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddExamForm({ onExamAdded }: { onExamAdded: () => void }) {
  const [form, setForm] = useState({ topic: '', date: '', duration: '', total_marks: '' })

  const handleAdd = async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) return alert('User not authenticated')

    const { data: teacher, error: teacherErr } = await supabase
      .from('teachers')
      .select('id, subject')
      .eq('user_id', user.id)
      .single()

    if (teacherErr || !teacher) {
      console.error(teacherErr)
      return alert('❌ Teacher not found. Please make sure your teacher profile exists.')
    }

    const { error } = await supabase.from('exams').insert({
      topic: form.topic,
      date: form.date,
      duration: parseInt(form.duration),
      total_marks: parseInt(form.total_marks),
      subject: teacher.subject,
      teacher_id: teacher.id,
    })

    if (error) {
      alert('❌ Failed to add exam')
      console.error(error)
    } else {
      alert('✅ Exam added')
      setForm({ topic: '', date: '', duration: '', total_marks: '' })
      onExamAdded()
    }
  }

  return (
    <div className="space-y-3 max-w-md">
      <input
        placeholder="Topic"
        value={form.topic}
        onChange={e => setForm({ ...form, topic: e.target.value })}
        className="border px-2 py-1 w-full"
      />
      <input
        type="date"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
        className="border px-2 py-1 w-full"
      />
      <input
        placeholder="Duration (minutes)"
        value={form.duration}
        onChange={e => setForm({ ...form, duration: e.target.value })}
        type="number"
        className="border px-2 py-1 w-full"
      />
      <input
        placeholder="Total Marks"
        value={form.total_marks}
        onChange={e => setForm({ ...form, total_marks: e.target.value })}
        type="number"
        className="border px-2 py-1 w-full"
      />
      <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </div>
  )
}
