'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TodaysTopic() {
  const [topic, setTopic] = useState('')
  const [teacher, setTeacher] = useState<any>(null)

  useEffect(() => {
    const teacherData = localStorage.getItem('user')
    if (teacherData) {
      setTeacher(JSON.parse(teacherData))
    } else {
      alert('⚠️ Teacher not logged in.')
    }
  }, [])

  const handleAddTopic = async () => {
    if (!teacher) {
      alert('⚠️ Please login as teacher')
      return
    }

    const { username, subject ,name} = teacher

    const { error } = await supabase.from('topics').insert({
      topic,
      username,
      subject,
      name,
      date: new Date().toISOString(),
    })

    if (error) {
      console.error(error)
      alert('❌ Failed to add topic')
      return
    }

    setTopic('')
    alert('✅ Topic Added')
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">📚 Today's Topic</h1>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Enter today's topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button
        onClick={handleAddTopic}
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
      >
        Add Topic
      </button>
    </div>
  )
}
