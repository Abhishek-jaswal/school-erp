'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

type Topic = {
  id: string; title: string; subject: string; date: string;
  expand?: { teacher_id?: { first_name?: string; last_name?: string; email?: string } };
};

export default function TodaysTopicsSection() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const data = await pb.collection('topics').getFullList({
          filter: `date="${today}"`,
          expand: 'teacher_id',
        });
        setTopics(data as unknown as Topic[]);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchTopics();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-[#1e1b4b] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            📘 Today's Topics
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : topics.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">No topics submitted today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {['#', 'Title', 'Subject', 'Teacher', 'Email'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topics.map((topic, i) => {
                  const teacher = topic.expand?.teacher_id;
                  const teacherName = teacher
                    ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim()
                    : '—';
                  return (
                    <tr key={topic.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-5 py-3.5 text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{topic.title}</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg">{topic.subject}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{teacherName}</td>
                      <td className="px-5 py-3.5 text-gray-400">{teacher?.email || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
