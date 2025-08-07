'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TodaysTopicsSection() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          subject,
          date,
          teacher:teacher_id ( id, full_name, email )
        `)
        .eq('date', today);

      if (error) console.error('Error loading topics:', error.message);
      else setTopics(data || []);

      setLoading(false);
    };

    fetchTopics();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6 w-full">
      <h2 className="text-xl font-semibold mb-4">📘 Today Topics by Teachers</h2>

      {loading ? (
        <p>Loading...</p>
      ) : topics.length === 0 ? (
        <p className="text-gray-500">No topics submitted today.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">#</th>
                <th className="p-2">Title</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Teacher</th>
                <th className="p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, index) => (
                <tr key={topic.id} className="border-t">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-medium">{topic.title}</td>
                  <td className="p-2">{topic.subject}</td>
                  <td className="p-2">{topic.teacher?.full_name}</td>
                  <td className="p-2">{topic.teacher?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
