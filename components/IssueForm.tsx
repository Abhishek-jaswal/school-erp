'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  role: 'teacher' | 'student';
  userId: string;
}

export default function IssueForm({ role, userId }: Props) {
  const [type, setType] = useState('Query');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return alert('Message cannot be empty');
    setLoading(true);

    const { error } = await supabase.from('issues').insert([
      {
        user_id: userId,
        role,
        type,
        message,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      },
    ]);

    if (error) alert('Failed to submit: ' + error.message);
    else {
      alert('Issue submitted successfully!');
      setMessage('');
      setType('Query');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Raise an Issue</h2>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="Query">Query</option>
        <option value="Suggestion">Suggestion</option>
        <option value="Withdraw">Withdraw</option>
        <option value="Technical">Technical</option>
      </select>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        className="w-full border p-3 rounded"
        placeholder="Write your message..."
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Submitting...' : 'Submit Issue'}
      </button>
    </div>
  );
}
