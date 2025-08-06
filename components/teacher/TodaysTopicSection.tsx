'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  teacher: any;
}

export default function TodaysTopicSection({ teacher }: Props) {
  const [topic, setTopic] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('teacher_id', teacher.id)
        .eq('date', today)
        .single();

      if (data) {
        setTopic(data.topic);
        setExistingId(data.id);
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today\'s topic:', error.message);
      }

      setLoading(false);
    };

    fetchTopic();
  }, [teacher.id]);

  const handleSubmit = async () => {
    if (!topic.trim()) {
      alert('Topic cannot be empty.');
      return;
    }

    setLoading(true);

    if (existingId) {
      const { error } = await supabase
        .from('topics')
        .update({ topic })
        .eq('id', existingId);

      if (error) alert('Update failed: ' + error.message);
      else alert('Topic updated!');
    } else {
      const { error } = await supabase.from('topics').insert([
        {
          teacher_id: teacher.id,
          subject: teacher.subject,
          topic,
          date: today,
        },
      ]);

      if (error) alert('Failed to save: ' + error.message);
      else alert('Topic saved!');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Today s Topic - {today}</h2>

      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        rows={5}
        className="w-full border p-3 rounded resize-y"
        placeholder={`Enter topic covered in ${teacher.subject} today...`}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Saving...' : existingId ? 'Update Topic' : 'Save Topic'}
      </button>
    </div>
  );
}
