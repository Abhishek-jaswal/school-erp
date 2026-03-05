'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Props { role: 'teacher' | 'student'; userId: string; }

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
    } catch (err: unknown) {
      alert('Failed to submit: ' + (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#1e1b4b]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Raise an Issue
          </h2>
          <p className="text-gray-400 text-sm mt-1">We'll get back to you as soon as possible</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Issue Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition">
            {['Query', 'Suggestion', 'Withdraw', 'Technical'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition"
            placeholder="Describe your issue in detail..." />
        </div>

        <div className="flex justify-end">
          <button onClick={handleSubmit} disabled={loading}
            className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-[#1e1b4b] hover:bg-indigo-900'}`}>
            {loading ? 'Submitting...' : 'Submit Issue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
