'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

type Notification = { id: string; message: string; created: string };

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await pb.collection('notifications').getFullList({ sort: '-created' });
        setNotifications(data as unknown as Notification[]);
      } catch (err) { console.error(err); }
      setLoading(false);
    };

    fetchNotifications();

    // Real-time subscription
    pb.collection('notifications').subscribe('*', (e) => {
      if (e.action === 'create') {
        setNotifications(prev => [e.record as unknown as Notification, ...prev]);
      }
    });

    return () => { pb.collection('notifications').unsubscribe('*'); };
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">🔔</div>
          <div>
            <h3 className="font-bold text-[#1e1b4b]" style={{ fontFamily: "'Playfair Display', serif" }}>Notifications</h3>
            <p className="text-gray-400 text-xs">{notifications.length} message{notifications.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No notifications yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {notifications.map((note) => (
              <li key={note.id}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 transition border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
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
