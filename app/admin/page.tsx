'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import AddUserModal from '@/components/AddUserModal';
import AdminIssuesList from '@/components/AdminIssuesList';
import AdminNotificationsPage from './notifications/page';
import UserProfileModal from '@/components/UserProfileModal';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'teachers' | 'students' | 'notifications' | 'issues'>('teachers');
  const [users, setUsers] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalStudents, setTotalStudents] = useState<number>(0);

  const isTableTab = tab === 'teachers' || tab === 'students';

  // Fetch counts (top dashboard cards)
  useEffect(() => {
    const fetchCounts = async () => {
      const { count: teacherCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      setTotalTeachers(teacherCount || 0);
      setTotalStudents(studentCount || 0);
    };

    fetchCounts();
  }, []);

  // Fetch users
  useEffect(() => {
    if (!isTableTab) return;

    const fetchUsers = async () => {
      const { data } = await supabase
        .from(tab)
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(data || []);
    };

    fetchUsers();

    const channel = supabase
      .channel(`${tab}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tab }, fetchUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = `${u.first_name} ${u.last_name}`.toLowerCase();
      return name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    });
  }, [users, search]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4 hidden md:block">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        {['teachers', 'students', 'notifications', 'issues'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`block w-full text-left px-4 py-2 rounded ${
              tab === t ? 'bg-gray-700' : 'hover:bg-gray-800'
            } capitalize`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => location.replace('/login')}
          className="block w-full text-left mt-8 px-4  text-red-400 hover:text-red-500"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold capitalize">{tab}</h1>
          {isTableTab && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setOpenModal(true)}
            >
              Add {tab === 'teachers' ? 'Teacher' : 'Student'}
            </button>
          )}
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow rounded p-4">
            <p className="text-gray-500 text-sm">Total Teachers</p>
            <p className="text-xl font-bold">{totalTeachers}</p>
          </div>
          <div className="bg-white shadow rounded p-4">
            <p className="text-gray-500 text-sm">Total Students</p>
            <p className="text-xl font-bold">{totalStudents}</p>
          </div>
        </div>

        {/* Search */}
        {isTableTab && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="border px-4 py-2 w-full max-w-md rounded shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Table */}
        {isTableTab && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded shadow-sm">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Subject</th>
                  <th className="px-4 py-2 border">Contact</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 text-left">
                    <td className="px-4 py-2 border whitespace-nowrap">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-2 border whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-2 border whitespace-nowrap">{u.subject}</td>
                    <td className="px-4 py-2 border whitespace-nowrap">{u.contact}</td>
                    <td className="px-4 py-2 border whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="bg-gray-800 text-white text-xs px-3 py-1 rounded hover:bg-gray-700"
                      >
                        View/Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifications' && <AdminNotificationsPage />}

        {/* Issues */}
        {tab === 'issues' && <AdminIssuesList />}

        {/* Add Modal */}
        {openModal && isTableTab && (
          <AddUserModal
            role={tab}
            onClose={() => setOpenModal(false)}
          />
        )}

        {/* Profile Modal */}
        {selectedUser && (
          <UserProfileModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            role={tab}
          />
        )}
      </main>
    </div>
  );
}
