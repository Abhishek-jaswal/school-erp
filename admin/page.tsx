'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AddUserModal from '@/components/AddUserModal';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'teachers' | 'students'>('teachers');
  const [users, setUsers] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);

  // Fetch data
  const fetchUsers = async () => {
    const { data } = await supabase
      .from(tab)
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel(`${tab}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tab }, fetchUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setTab('teachers')} className="block w-full text-left">Teachers</button>
        <button onClick={() => setTab('students')} className="block w-full text-left">Students</button>
        <button onClick={() => alert('Coming soon')}>Notifications</button>
        <button onClick={() => alert('Coming soon')}>Issues</button>
        <button onClick={() => location.replace('/login')}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold capitalize">{tab}</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setOpenModal(true)}
          >
            Add {tab === 'teachers' ? 'Teacher' : 'Student'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 border">Name</th>
                <th className="px-3 py-2 border">Email</th>
                <th className="px-3 py-2 border">Subject</th>
                <th className="px-3 py-2 border">Contact</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="text-center">
                  <td className="border px-2 py-1">{u.first_name} {u.last_name}</td>
                  <td className="border px-2 py-1">{u.email}</td>
                  <td className="border px-2 py-1">{u.subject}</td>
                  <td className="border px-2 py-1">{u.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        {openModal && (
          <AddUserModal
            role={tab}
            onClose={() => setOpenModal(false)}
          />
        )}
      </div>
    </div>
  );
}
