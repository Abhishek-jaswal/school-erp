'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherIssue() {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('Query')
  const [username, setUsername] = useState('')
  const [subject, setSubject] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const teacherData = localStorage.getItem('user')
    if (teacherData) {
      const parsed = JSON.parse(teacherData)
      setUsername(parsed.username)
      setSubject(parsed.subject)
      setUserId(parsed.id) // use localStorage-based ID
    } else {
      alert('⚠️ Teacher not logged in')
    }
  }, [])

  const submitIssue = async () => {
    if (!userId) {
      alert('User not logged in')
      return
    }

    const { error } = await supabase.from('issues').insert({
      type,
      message,
      role: 'teacher',
      status: 'Pending',
      username,
      subject,
      created_at: new Date().toISOString(),
    })

    if (error) {
      alert('❌ Failed to submit issue')
      console.error(error)
      return
    }

    alert('✅ Issue Sent')
    setMessage('')
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">🆘 Raise Issue</h1>

      <select
        onChange={(e) => setType(e.target.value)}
        className="p-2 border rounded"
        value={type}
      >
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

      <button
        onClick={submitIssue}
        className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  )
}
