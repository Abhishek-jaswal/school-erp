'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherIssue() {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('Query')

  const submitIssue = async () => {
    const { data: user } = await supabase.auth.getUser()
    await supabase.from('issues').insert({
      type,
      message,
      role: 'teacher',
      user_id: user.user?.id,
      date: new Date().toISOString(),
      status: 'Pending',
    })
    alert('✅ Issue Sent')
    setMessage('')
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">🆘 Raise Issue</h1>
      <select onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
        <option>Query</option>
        <option>Technical</option>
        <option>Suggestion</option>
      </select>
      <textarea
        className="w-full mt-2 p-2 border rounded"
        placeholder="Enter your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={submitIssue} className="mt-2 bg-red-600 text-white px-4 py-2 rounded">Submit</button>
    </div>
  )
}
