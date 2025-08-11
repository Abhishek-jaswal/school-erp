"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const AddUserModal = dynamic(() => import('@/components/AddUserModal'));
const AdminIssuesList = dynamic(() => import('@/components/AdminIssuesList'));
const AdminNotificationsPage = dynamic(() => import('./notifications/page'));
const UserProfileModal = dynamic(() => import('@/components/UserProfileModal'));
const TodaysTopicsSection = dynamic(() => import('@/components/TodaysTopicsSection'));
const TeacherPerformanceSummary = dynamic(() => import('@/components/TeacherPerformanceSummary'));



const tabs = [
  { key: 'teachers', label: 'Teachers' },
  { key: 'students', label: 'Students' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'issues', label: 'Issues' },
  { key: 'todaytopic', label: 'Today Topic' },
  { key: 'TeacherPerformanceSummary', label: 'Teacher Performance' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'teachers' | 'students' | 'notifications' | 'todaytopic' | 'TeacherPerformanceSummary'|'issues'>('teachers');
  const [users, setUsers] = useState<{ id: string; first_name: string; last_name: string; email: string; subject?: string; contact?: string }[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalStudents, setTotalStudents] = useState<number>(0);

  const isTableTab = useMemo(() => tab === 'teachers' || tab === 'students', [tab]);

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: teacherCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });

      setTotalTeachers(teacherCount || 0);
      setTotalStudents(studentCount || 0);
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    if (!isTableTab) return;

    const fetchUsers = async () => {
      const { data } = await supabase.from(tab).select('*').order('created_at', { ascending: false });
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
  }, [tab, isTableTab]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = `${u.first_name} ${u.last_name}`.toLowerCase();
      return name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    });
  }, [users, search]);

  const handleTabChange = useCallback((key: string) => {
    setTab(key as typeof tab);
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white w-64 p-4 space-y-4 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-20 h-full`}
      >
        <h2 className="text-xl font-bold mb-4">🛠 Admin Panel</h2>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`block w-full text-left px-2 py-2 rounded hover:bg-gray-700 transition ${tab === t.key ? 'bg-gray-700 font-semibold' : ''}`}
          >
            {t.label}
          </button>
        ))}

        <button
          onClick={() => router.push('/login')}
          className="block w-full mt-6 text-left px-2 py-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          Logout
        </button>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 w-full">
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold capitalize">{tab}</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 border px-3 py-1 rounded"
          >
            {sidebarOpen ? 'Close' : 'Menu'}
          </button>
        </div>

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

        {isTableTab && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="border px-4 py-2 w-full max-w-md rounded shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setOpenModal(true)}
            >
              Add {tab === 'teachers' ? 'Teacher' : 'Student'}
            </button>
          </div>
        )}

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

        {tab === 'notifications' && <AdminNotificationsPage />}
        {tab === 'issues' && <AdminIssuesList />}
        {tab === 'todaytopic' && <TodaysTopicsSection />}
        {tab === 'TeacherPerformanceSummary' && <TeacherPerformanceSummary />}

       {openModal && isTableTab && (
  <AddUserModal role={tab as 'teachers' | 'students'} onClose={() => setOpenModal(false)} />
)}

{selectedUser && isTableTab && (
  <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} role={tab as 'teachers' | 'students'} />
)}

        </main>
    </div>
  );
}
