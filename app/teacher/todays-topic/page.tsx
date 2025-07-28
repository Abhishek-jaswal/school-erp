'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TodaysTopic() {
  const [topic, setTopic] = useState('')

  const handleAddTopic = async () => {
    const { data: user } = await supabase.auth.getUser()
    await supabase.from('topics').insert({
      topic,
      teacher_id: user.user?.id,
      date: new Date().toISOString(),
    })
    setTopic('')
    alert('Topic Added')
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
      <button onClick={handleAddTopic} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">Add Topic</button>
    </div>
  )
}
