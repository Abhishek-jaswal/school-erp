'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Teacher { id: string; subject: string; }
interface Props { teacher: Teacher; }

export default function TodaysTopicSection({ teacher }: Props) {
  const [topic, setTopic] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const data = await pb.collection('topics').getFirstListItem(
          `teacher_id="${teacher.id}" && date="${today}"`
        );
        // Support both 'title' and 'topic' field names
        setTopic((data['title'] || data['topic'] || '') as string);
        setExistingId(data.id);
      } catch {
        // No topic today yet
      }
      setLoading(false);
    };
    fetchTopic();
  }, [teacher.id, today]);

  const handleSubmit = async () => {
    if (!topic.trim()) return alert('Topic cannot be empty.');
    setLoading(true);
    try {
      if (existingId) {
        await pb.collection('topics').update(existingId, { title: topic, topic });
        alert('Topic updated successfully!');
      } else {
        const record = await pb.collection('topics').create({
          teacher_id: teacher.id,
          subject: teacher.subject,
          title: topic,
          topic,
          date: today,
        });
        setExistingId(record.id);
        alert('Topic saved successfully!');
      }
    } catch (err: unknown) {
      alert('Failed: ' + (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="font-bold text-[#1e1b4b] text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          💡 Today's Topic
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}<span className="font-medium text-gray-600">{teacher.subject}</span>
        </p>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={6}
          placeholder={`What did you teach in ${teacher.subject} today?`}
          className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white resize-y transition"
        />

        <div className="flex items-center justify-between mt-4">
          {existingId && (
            <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg font-medium">
              ✓ Already submitted today
            </span>
          )}
          <div className="ml-auto">
            <button onClick={handleSubmit} disabled={loading}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-[#1e1b4b] hover:bg-indigo-900'}`}>
              {loading ? 'Saving...' : existingId ? 'Update Topic' : 'Save Topic →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
