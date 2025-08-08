'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types';

export default function AdminNotificationsPage() {
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications when the component loads
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    setNotifications(data || []);
  };

  // Add new notification
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
        Add Notifications
      </h2>

      {/* Notification input + button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter notification message"
          className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Notification'}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">📝 All Notifications</h3>

        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((note) => (
              <li
                key={note.id}
                className="border p-3 rounded bg-gray-50 shadow-sm hover:bg-gray-100 transition"
              >
                <div className="text-sm text-gray-800">{note.message}</div>
                <div className="text-xs text-gray-500">
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
