'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

type Notification = { id: string; message: string; created: string };

export default function AdminNotificationsPage() {
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const data = await pb.collection('notifications').getFullList({ sort: '-created' });
      setNotifications(data as unknown as Notification[]);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async () => {
    if (!message.trim()) return alert('Enter a message');
    setLoading(true);
    try {
      await pb.collection('notifications').create({ message });
      setMessage('');
      fetchNotifications();
    } catch (err: unknown) {
      alert('Failed: ' + (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
        <h3 className="font-bold text-[#1e1b4b] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          📣 Broadcast Notification
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your notification message..."
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
          />
          <button onClick={handleAdd} disabled={loading}
            className="bg-[#1e1b4b] hover:bg-indigo-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap">
            {loading ? 'Sending...' : '📤 Send'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
        <h3 className="font-semibold text-gray-700 mb-4">
          All Notifications <span className="text-gray-400 font-normal text-sm">({notifications.length})</span>
        </h3>
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((note) => (
              <li key={note.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-indigo-50/50 transition border border-gray-100">
                <span className="text-indigo-400 text-lg mt-0.5">🔔</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{note.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(note.created).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
