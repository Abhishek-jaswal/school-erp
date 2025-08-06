'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminNotificationsPage() {
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications on load
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    setNotifications(data || []);
  };

  const handleAdd = async () => {
    if (!message.trim()) return alert('Enter a message');

    setLoading(true);
    const { error } = await supabase.from('notifications').insert([{ message }]);

    if (error) {
      alert('Failed to add notification');
    } else {
      setMessage('');
      fetchNotifications();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">📢 Admin Notifications</h2>

      <div className="flex gap-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter notification message"
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Adding...' : 'Add Notification'}
        </button>
      </div>

      <div className="space-y-3 mt-6">
        <h3 className="text-lg font-semibold">📝 All Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((note) => (
              <li key={note.id} className="border p-3 rounded bg-gray-50">
                <div className="text-sm text-gray-700">{note.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
