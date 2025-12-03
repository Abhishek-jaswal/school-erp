'use client';

import { useEffect, useState } from 'react';
import {pb} from '@/lib/pb';

export default function AdminNotificationsPage() {
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const data = await pb.collection('notifications').getFullList({
      sort: '-created',
    });
    setNotifications(data);
  };

  const handleAdd = async () => {
    if (!message.trim()) return alert('Enter a message');

    setLoading(true);

    await pb.collection('notifications').create({ message });

    setMessage('');
    await fetchNotifications();

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Add Notifications</h2>

      <div className="flex flex-col sm:flex-row gap-4">
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

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">📝 All Notifications</h3>

        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((note) => (
              <li key={note.id} className="border p-3 rounded bg-gray-50">
                <div>{note.message}</div>
                <div className="text-xs text-gray-500">
                  {new Date(note.created).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
