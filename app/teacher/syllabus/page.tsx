'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddSyllabus() {
  const [syllabus, setSyllabus] = useState('')
  const [subject, setSubject] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()

    const teacherData = localStorage.getItem('user')
    if (teacherData) {
      const parsed = JSON.parse(teacherData)
      setSubject(parsed.subject)
      setTeacherId(parsed.id)
    } else {
      alert('⚠️ Teacher not logged in')
    }
  }, [])

  const handleAdd = async () => {
    if (!syllabus.trim()) {
      alert('⚠️ Syllabus cannot be empty')
      return
    }

    if (!subject || !teacherId) {
      alert('❗ Missing teacher information')
      return
    }

    const { error } = await supabase.from('syllabus').insert({
      subject,
      syllabus,
      teacher_id: teacherId,
    })

    if (error) {
      alert('❌ Failed to add syllabus')
      console.error(error)
      return
    }

    alert(`✅ Syllabus added for ${subject}`)
    setSyllabus('')
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">📘 Add Syllabus</h1>
      <textarea
        ref={inputRef}
        className="w-full p-2 border rounded"
        placeholder="Write syllabus here..."
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
        rows={6}
      />
      <button
        onClick={handleAdd}
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  )
}
