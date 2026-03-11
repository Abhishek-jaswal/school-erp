'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

const AddUserModal = dynamic(() => import('@/components/AddUserModal'));
const AdminIssuesList = dynamic(() => import('@/components/AdminIssuesList'));
const AdminNotificationsPage = dynamic(() => import('./notifications/page'));
const UserProfileModal = dynamic(() => import('@/components/UserProfileModal'));
const TodaysTopicsSection = dynamic(() => import('@/components/TodaysTopicsSection'));
const TeacherPerformanceSummary = dynamic(() => import('@/components/TeacherPerformanceSummary'));

const tabs = [
  { key: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
  { key: 'students', label: 'Students', icon: '🎓' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'issues', label: 'Issues', icon: '⚠️' },
  { key: 'todaytopic', label: "Today's Topics", icon: '📘' },
  { key: 'TeacherPerformanceSummary', label: 'Performance', icon: '📊' },
];

type UserRecord = {
  id: string; first_name: string; last_name: string;
  email: string; subject?: string; contact?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('teachers');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  const isTableTab = useMemo(() => tab === 'teachers' || tab === 'students', [tab]);

  // Fetch counts — use sequential awaits (not Promise.all) to avoid auto-cancel
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const teacherRes = await pb.collection('teachers').getList(1, 1);
        const studentRes = await pb.collection('students').getList(1, 1);
        setTotalTeachers(teacherRes.totalItems);
        setTotalStudents(studentRes.totalItems);
      } catch (err) {
        console.error('fetchCounts error:', err);
      }
    };
    fetchCounts();
  }, []);

  // Fetch users when on a table tab
  useEffect(() => {
    if (!isTableTab) return;

    const fetchUsers = async () => {
      try {
        const records = await pb.collection(tab).getFullList({ sort: '-created' });
        setUsers(records as unknown as UserRecord[]);
      } catch (err) {
        console.error('fetchUsers error:', err);
      }
    };

    fetchUsers();

    // Real-time updates
    pb.collection(tab).subscribe('*', () => fetchUsers());
    return () => { pb.collection(tab).unsubscribe('*'); };
  }, [tab, isTableTab]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = `${u.first_name} ${u.last_name}`.toLowerCase();
      return (
        name.includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [users, search]);

  const handleTabChange = useCallback((key: string) => {
    setTab(key);
    setSidebarOpen(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    router.replace('/login');
  };

  const stats = [
    { label: 'Total Teachers', value: totalTeachers, icon: '👨‍🏫', color: 'from-violet-500 to-indigo-600' },
    { label: 'Total Students', value: totalStudents, icon: '🎓', color: 'from-amber-400 to-orange-500' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f4f0]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside className={`bg-[#1e1b4b] text-white w-64 flex flex-col transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 h-full`}>

        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-lg">🏫</div>
            <div>
              <h2 className="font-bold text-lg leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>EduTrack</h2>
              <p className="text-white/40 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
              className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.key ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/8 hover:text-white/80'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#f5f4f0]/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between">
          <div className="md:hidden">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-sm bg-white">
              {sidebarOpen ? '✕ Close' : '☰ Menu'}
            </button>
          </div>
          <h1 className="hidden md:block text-lg font-bold text-[#1e1b4b]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {tabs.find(t => t.key === tab)?.icon} {tabs.find(t => t.key === tab)?.label}
          </h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3 shadow-md`}>{s.icon}</div>
                <p className="text-3xl font-bold text-[#1e1b4b]">{s.value}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table controls */}
          {isTableTab && (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input type="text" placeholder="Search by name or email..."
                  className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-72"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button onClick={() => setOpenModal(true)}
                className="bg-[#1e1b4b] hover:bg-indigo-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition">
                + Add {tab === 'teachers' ? 'Teacher' : 'Student'}
              </button>
            </div>
          )}

          {/* Users table */}
          {isTableTab && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1e1b4b]/5 text-[#1e1b4b] text-xs font-semibold uppercase tracking-wider">
                      {['Name', 'Email', 'Subject', 'Contact', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                          No records found
                        </td>
                      </tr>
                    ) : filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </div>
                            {u.first_name} {u.last_name}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{u.email}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {u.subject && (
                            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                              {u.subject}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{u.contact || '—'}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <button onClick={() => setSelectedUser(u)}
                            className="bg-[#1e1b4b] hover:bg-indigo-900 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium">
                            View / Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dynamic tabs */}
          {tab === 'notifications' && <AdminNotificationsPage />}
          {tab === 'issues' && <AdminIssuesList />}
          {tab === 'todaytopic' && <TodaysTopicsSection />}
          {tab === 'TeacherPerformanceSummary' && <TeacherPerformanceSummary />}
        </div>
      </main>

      {openModal && isTableTab && (
        <AddUserModal
          role={tab as 'teachers' | 'students'}
          onClose={() => { setOpenModal(false); }}
        />
      )}
      {selectedUser && isTableTab && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          role={tab as 'teachers' | 'students'}
        />
      )}
    </div>
  );
}
