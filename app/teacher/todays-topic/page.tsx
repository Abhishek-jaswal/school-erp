'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TodaysTopic() {
  const [topic, setTopic] = useState('')

  const handleAddTopic = async () => {
    // 1. Get the logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError)
      return alert('User not logged in')
    }

    // 2. Fetch teacher details using user.id
    const {
      data: teacherData,
      error: teacherError,
    } = await supabase
      .from('teachers')
      .select('username, subject')
      .eq('id', user.id)
      .single()

    if (teacherError || !teacherData) {
      console.error('Error fetching teacher details:', teacherError)
      return alert('Failed to fetch teacher info')
    }

    const { username, subject } = teacherData

    // 3. Insert topic using teacher's username as teacher_id
    const { error: insertError } = await supabase.from('topics').insert({
      topic: topic.trim(),
      teacher_id: username, // using username as teacher_id
      subject,
      date: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Insert error:', insertError)
      return alert('Failed to add topic')
    }

    setTopic('')
    alert('✅ Topic added successfully!')
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">📚 Today Topic</h1>
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
