'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import dynamic from 'next/dynamic';

const ProfileSection = dynamic(() => import('@/components/teacher/ProfileSection'));
const StudentsSection = dynamic(() => import('@/components/teacher/StudentsSection'));
const AddExamSection = dynamic(() => import('@/components/teacher/AddExamSection'));
const AddSyllabusSection = dynamic(() => import('@/components/teacher/AddSyllabusSection'));
const TodaysTopicSection = dynamic(() => import('@/components/teacher/TodaysTopicSection'));
const IssueForm = dynamic(() => import('@/components/IssueForm'));
const StudentScoresPanel = dynamic(() => import('@/components/teacher/StudentScoresPanel'));
const NotificationsList = dynamic(() => import('@/components/NotificationsList'));

const sections = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'students', label: 'Students', icon: '🎓' },
  { key: 'addExam', label: 'Add Exam', icon: '📝' },
  { key: 'syllabus', label: 'Add Syllabus', icon: '📚' },
  { key: 'topic', label: "Today's Topic", icon: '💡' },
  { key: 'scores', label: 'Exam Scores', icon: '📊' },
  { key: 'issue', label: 'Raise Issue', icon: '⚠️' },
  { key: 'notification', label: 'Notifications', icon: '🔔' },
];

type Teacher = Record<string, string>;

export default function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState('profile');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    // Guard: must have userId and correct role
    if (!id || role !== 'teacher') {
      router.replace('/login');
      return;
    }

    const fetchTeacher = async () => {
      try {
        const data = await pb.collection('teachers').getOne(id);
        setTeacher(data as unknown as Teacher);
      } catch (err: unknown) {
        const pbErr = err as { status?: number };
        if (pbErr?.status === 404) {
          // User ID not found in teachers table
          setError('Teacher record not found. Please contact admin.');
        } else if (pbErr?.status === 401 || pbErr?.status === 403) {
          // Auth issue — clear and redirect
          localStorage.removeItem('userId');
          localStorage.removeItem('role');
          router.replace('/login');
        } else {
          setError('Failed to load teacher data. Please try again.');
          console.error('Teacher fetch error:', err);
        }
      }
    };

    fetchTeacher();
  }, [router]);

  const handleLogout = () => {
    pb.authStore.clear();
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    router.replace('/login');
  };

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f4f0]">
      <div className="text-center space-y-4 p-8">
        <span className="text-5xl block">⚠️</span>
        <p className="text-gray-700 font-semibold">{error}</p>
        <button onClick={handleLogout}
          className="bg-[#1e1b4b] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-900 transition">
          Back to Login
        </button>
      </div>
    </div>
  );

  if (!teacher) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f4f0]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Loading teacher data...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f4f0]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside className={`bg-[#1e1b4b] text-white w-64 flex flex-col transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 h-full`}>

        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
              {teacher.first_name?.[0]}{teacher.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{teacher.first_name} {teacher.last_name}</p>
              <p className="text-white/40 text-xs truncate">{teacher.subject}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sections.map(({ key, label, icon }) => (
            <button key={key}
              onClick={() => { setActiveSection(key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeSection === key ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/8 hover:text-white/80'}`}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#f5f4f0]/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between md:hidden">
          <h1 className="font-bold text-[#1e1b4b]">📘 Teacher Dashboard</h1>
          <button onClick={() => setSidebarOpen(p => !p)}
            className="text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-sm bg-white">
            {sidebarOpen ? '✕' : '☰ Menu'}
          </button>
        </div>

        <div className="p-6">
          {activeSection === 'profile' && <ProfileSection teacher={teacher as never} />}
          {activeSection === 'students' && <StudentsSection subject={teacher.subject} />}
          {activeSection === 'addExam' && <AddExamSection teacher={teacher as never} />}
          {activeSection === 'syllabus' && <AddSyllabusSection teacher={teacher as never} />}
          {activeSection === 'topic' && <TodaysTopicSection teacher={teacher as never} />}
          {activeSection === 'issue' && <IssueForm role="teacher" userId={teacher.id} />}
          {activeSection === 'scores' && <StudentScoresPanel teacher={teacher as never} />}
          {activeSection === 'notification' && <NotificationsList />}
        </div>
      </main>
    </div>
  );
}
