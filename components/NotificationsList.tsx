'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch of all notifications
    fetchNotifications();

    // Subscribe to real-time INSERTs on 'notifications' table
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          // Prepend new notification to the list
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    // Clean up the subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch notifications from Supabase (sorted by latest first)
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    setNotifications(data || []);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span role="img" aria-label="bell">🔔</span> Notifications
      </h3>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((note) => (
            <li
              key={note.id}
              className="p-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg border border-gray-200"
            >
              <div className="text-sm text-gray-700">{note.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(note.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
