'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase.from('notifications').insert([
      { title, message }
    ]);

    setLoading(false);

    if (error) {
      console.error('Error sending notification:', error.message);
      alert('Failed to send notification');
    } else {
      setSuccess(true);
      setTitle('');
      setMessage('');
      fetchNotifications(); // Refresh list
    }
  };

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar role="admin" />
      <div className="flex-1 p-4 sm:p-8 w-full max-w-screen-lg mx-auto ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-200">Send Notification</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 shadow-md rounded-xl text-gray-200 p-4 sm:p-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            rows={4}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
          {success && <p className="text-green-600 font-medium">✅ Notification sent successfully!</p>}
        </form>

        <h2 className="text-xl font-semibold mt-10 mb-4 text-gray-200">Previous Notifications</h2>
        <div className="space-y-4">
          {notifications.length === 0 && <p className="text-gray-500">No notifications yet.</p>}
          {notifications.map((note) => (
            <div key={note.id} className="bg-gray-800 p-4 rounded-xl text-gray-200 shadow-sm">
              <h3 className="text-lg font-bold">{note.title}</h3>
              <p className="text-gray-700">{note.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(note.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
