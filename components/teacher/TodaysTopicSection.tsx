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

  // Format today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's topic on component mount
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

      // Ignore "no row found" error
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today\'s topic:', error.message);
      }

      setLoading(false);
    };

    fetchTopic();
  }, [teacher.id, today]);

  // Save or update topic
  const handleSubmit = async () => {
    if (!topic.trim()) {
      alert('Topic cannot be empty.');
      return;
    }

    setLoading(true);

    if (existingId) {
      // Update topic
      const { error } = await supabase
        .from('topics')
        .update({ topic })
        .eq('id', existingId);

      if (error) alert('Update failed: ' + error.message);
      else alert('Topic updated successfully!');
    } else {
      // Insert new topic
      const { error } = await supabase.from('topics').insert([
        {
          teacher_id: teacher.id,
          subject: teacher.subject,
          topic,
          date: today,
        },
      ]);

      if (error) alert('Failed to save: ' + error.message);
      else alert('Topic saved successfully!');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-gray-800">
        Today's Topic – <span className="text-blue-600 font-medium">{today}</span>
      </h2>

      {/* Textarea Input */}
      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        rows={6}
        className="w-full border border-gray-300 rounded-md p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
        placeholder={`Enter topic taught in ${teacher.subject}...`}
      />

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full sm:w-auto px-6 py-3 rounded-md text-white font-medium transition-all duration-200 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading
          ? 'Saving...'
          : existingId
          ? 'Update Topic'
          : 'Save Topic'}
      </button>
    </div>
  );
}
