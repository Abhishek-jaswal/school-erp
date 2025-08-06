'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    setNotifications(data || []);
  };

  return (
    <div className="mt-6 bg-white border rounded p-4 max-w-3xl">
      <h3 className="text-lg font-bold mb-2">🔔 Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((note) => (
            <li key={note.id} className="bg-gray-50 p-2 rounded border">
              <div className="text-sm">{note.message}</div>
              <div className="text-xs text-gray-400">
                {new Date(note.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
