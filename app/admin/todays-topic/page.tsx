'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminTodayTopic() {
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('date', { ascending: false })

      if (!error && data) {
        setTopics(data)
      } else {
        console.error('Failed to fetch topics:', error)
      }

      setLoading(false)
    }

    fetchTopics()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl w-full mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">
          📚 Topics Shared by Teachers
        </h1>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <p className="text-gray-400">Loading topics...</p>
          ) : topics.length === 0 ? (
            <p className="text-gray-400">No topics shared yet.</p>
          ) : (
            <table className="min-w-full text-sm text-left text-gray-200">
              <thead className="bg-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Topic</th>
                  <th className="px-4 py-2">Teacher Name</th>
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic, index) => (
                  <tr key={topic.id} className="border-b border-gray-700">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{topic.topic}</td>
                    <td className="px-4 py-2">{topic.name}</td>
                    <td className="px-4 py-2">{topic.username}</td>
                    <td className="px-4 py-2">{topic.subject}</td>
                    <td className="px-4 py-2">
                      {new Date(topic.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
