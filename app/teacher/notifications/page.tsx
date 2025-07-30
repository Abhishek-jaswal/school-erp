'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TeacherNotificationsPage() {
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
      <div className="flex-1 p-4 sm:p-8 w-full max-w-screen-lg mx-auto ">
        
       

        <h1 className="text-xl font-semibold mt-10 mb-4 text-gray-200"> Notifications</h1>
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
