'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddSyllabus() {
  const [syllabus, setSyllabus] = useState('')

  const handleAdd = async () => {
    const { data: user } = await supabase.auth.getUser()
    const { data: teacher } = await supabase
      .from('teachers')
      .select('subject')
      .eq('user_id', user.user?.id)
      .single()

    await supabase.from('syllabus').insert({
      subject: teacher.subject,
      syllabus,
      teacher_id: user.user?.id,
    })
    alert('✅ Syllabus added')
    setSyllabus('')
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">📘 Add Syllabus</h1>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Write syllabus here..."
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
      />
      <button onClick={handleAdd} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
    </div>
  )
}
