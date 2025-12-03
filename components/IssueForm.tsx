'use client';

import { useState } from 'react';
import { pb } from '@/lib/pb';

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

    try {
      await pb.collection('issues').create({
        user_id: userId,
        role,
        type,
        message,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      });

      alert('✅ Issue submitted successfully!');
      setMessage('');
      setType('Query');

    } catch (error: any) {
      alert('Failed to submit: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 py-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Raise an Issue</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Issue Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Query">Query</option>
          <option value="Suggestion">Suggestion</option>
          <option value="Withdraw">Withdraw</option>
          <option value="Technical">Technical</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Write your message here..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-5 py-2 rounded-md text-white font-medium transition ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Issue'}
        </button>
      </div>
    </div>
  );
}
