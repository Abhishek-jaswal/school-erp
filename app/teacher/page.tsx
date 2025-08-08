'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { Teacher } from '@/types';

// Dynamic imports for better performance
const ProfileSection = dynamic(() => import('@/components/teacher/ProfileSection'));
const StudentsSection = dynamic(() => import('@/components/teacher/StudentsSection'));
const AddExamSection = dynamic(() => import('@/components/teacher/AddExamSection'));
const AddSyllabusSection = dynamic(() => import('@/components/teacher/AddSyllabusSection'));
const TodaysTopicSection = dynamic(() => import('@/components/teacher/TodaysTopicSection'));
const IssueForm = dynamic(() => import('@/components/IssueForm'));
const StudentScoresPanel = dynamic(() => import('@/components/teacher/StudentScoresPanel'));
const NotificationsList = dynamic(() => import('@/components/NotificationsList'));

const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Memoized section list to avoid unnecessary re-renders
  const sections = useMemo(() => [
    { key: 'profile', label: 'Profile' },
    { key: 'students', label: 'Students' },
    { key: 'addExam', label: 'Add Exam' },
    { key: 'syllabus', label: 'Add Syllabus' },
    { key: 'topic', label: 'Today’s Topic' },
    { key: 'issue', label: 'Raise Issue' },
    { key: 'notification', label: 'Notifications' },
    { key: 'scores', label: 'Exam Score' },
  ], []);

  useEffect(() => {
    const fetchTeacher = async () => {
      const id = localStorage.getItem('userId');
      if (!id) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error('Fetch error:', error);
      else setTeacher(data);
    };

    fetchTeacher();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    router.push('/login');
  };

  if (!teacher) {
    return <div className="p-6 text-center text-gray-600">Loading teacher data...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-20 h-full w-64 p-4 space-y-4 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <h2 className="text-xl font-bold mb-4">📘 Teacher Panel</h2>

        {sections.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setActiveSection(key);
              setSidebarOpen(false);
            }}
            className={`block w-full text-left px-2 py-2 rounded transition hover:bg-gray-700 ${
              activeSection === key ? 'bg-gray-700 font-semibold' : ''
            }`}
          >
            {label}
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="block w-full mt-6 px-2 py-2 text-left rounded bg-red-600 hover:bg-red-700 transition"
        >
          Logout
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
        {/* Mobile Topbar */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">Teacher Dashboard</h1>
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="px-3 py-1 border rounded text-gray-700"
          >
            {sidebarOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* Render Sections */}
        {activeSection === 'profile' && <ProfileSection teacher={teacher} />}
        {activeSection === 'students' && <StudentsSection subject={teacher.subject} />}
        {activeSection === 'addExam' && <AddExamSection teacher={teacher} />}
        {activeSection === 'syllabus' && <AddSyllabusSection teacher={teacher} />}
        {activeSection === 'topic' && <TodaysTopicSection teacher={teacher} />}
        {activeSection === 'issue' && <IssueForm role="teacher" userId={teacher.id} />}
        {activeSection === 'scores' && <StudentScoresPanel teacher={teacher} />}
        {activeSection === 'notification' && <NotificationsList />}
      </main>
    </div>
  );
};

export default TeacherDashboard;
