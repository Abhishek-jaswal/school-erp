'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

import ProfileSection from '@/components/student/ProfileSection';
import SyllabusView from '@/components/student/SyllabusView';
import ExamView from '@/components/student/ExamView';
import IssueForm from '@/components/IssueForm';
import NotificationsList from '@/components/NotificationsList';

const sections = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'syllabus', label: 'Syllabus', icon: '📚' },
  { key: 'exams', label: 'Exams', icon: '📝' },
  { key: 'issue', label: 'Raise Issue', icon: '⚠️' },
  { key: 'notification', label: 'Notifications', icon: '🔔' },
];

type Student = Record<string, string>;

export default function StudentDashboard() {
  const [section, setSection] = useState('profile');
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    // Guard: must have userId and correct role
    if (!id || role !== 'student') {
      router.replace('/login');
      return;
    }

    const fetchStudent = async () => {
      try {
        const data = await pb.collection('students').getOne(id);
        setStudent(data as unknown as Student);
      } catch (err: unknown) {
        const pbErr = err as { status?: number };
        if (pbErr?.status === 404) {
          setError('Student record not found. Please contact admin.');
        } else if (pbErr?.status === 401 || pbErr?.status === 403) {
          localStorage.removeItem('userId');
          localStorage.removeItem('role');
          router.replace('/login');
        } else {
          setError('Failed to load student data. Please try again.');
          console.error('Student fetch error:', err);
        }
      }
    };

    fetchStudent();
  }, [router]);

  const handleLogout = useCallback(() => {
    pb.authStore.clear();
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    router.replace('/login');
  }, [router]);

  const sectionComponent = useMemo(() => {
    if (!student) return null;
    switch (section) {
      case 'profile': return <ProfileSection student={student as never} />;
      case 'syllabus': return <SyllabusView subject={student.subject} />;
      case 'exams': return <ExamView student={student as never} />;
      case 'issue': return <IssueForm role="student" userId={student.id} />;
      case 'notification': return <NotificationsList />;
      default: return null;
    }
  }, [section, student]);

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

  if (!student) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f4f0]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-500 rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Loading student data...</p>
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
              {student.first_name?.[0]}{student.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{student.first_name} {student.last_name}</p>
              <p className="text-white/40 text-xs truncate">{student.subject}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sections.map((sec) => (
            <button key={sec.key}
              onClick={() => { setSection(sec.key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${section === sec.key ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/8 hover:text-white/80'}`}>
              <span>{sec.icon}</span>{sec.label}
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
          <h1 className="font-bold text-[#1e1b4b]">🎓 Student Dashboard</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-sm bg-white">
            {sidebarOpen ? '✕' : '☰ Menu'}
          </button>
        </div>
        <div className="p-6">{sectionComponent}</div>
      </main>
    </div>
  );
}
