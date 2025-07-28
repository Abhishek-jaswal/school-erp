'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase.from('notifications').insert([
      {
        title,
        message,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('Error sending notification:', error.message);
      alert('Failed to send notification');
    } else {
      setSuccess(true);
      setTitle('');
      setMessage('');
    }
  };

  return (
      <div  className="flex min-h-screen">
            <Sidebar role="admin" />
      <h1 className="text-2xl font-bold mb-4">Send Notification</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
        {success && <p className="text-green-600">Notification sent successfully!</p>}
      </form>
    </div>
  );
}
