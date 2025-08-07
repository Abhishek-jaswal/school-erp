'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Components
import ProfileSection from '@/components/teacher/ProfileSection';
import StudentsSection from '@/components/teacher/StudentsSection';
import AddExamSection from '@/components/teacher/AddExamSection';
import AddSyllabusSection from '@/components/teacher/AddSyllabusSection';
import TodaysTopicSection from '@/components/teacher/TodaysTopicSection';
import IssueForm from '@/components/IssueForm';
import StudentScoresPanel from '@/components/teacher/StudentScoresPanel';
import NotificationsList from '@/components/NotificationsList';

const sections = [
  { key: 'profile', label: 'Profile' },
  { key: 'students', label: 'Students' },
  { key: 'addExam', label: 'Add Exam' },
  { key: 'syllabus', label: 'Add Syllabus' },
  { key: 'topic', label: 'Today’s Topic' },
  { key: 'issue', label: 'Raise Issue' },
  { key: 'notification', label: 'Notifications' },
  { key: 'scores', label: 'Exam Score' },
];

export default function TeacherDashboard() {
  const [section, setSection] = useState('profile');
  const [teacher, setTeacher] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/login');
      return;
    }

    // Fetch teacher data
    const fetchTeacher = async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();

      if (data) setTeacher(data);
      else console.error(error);
    };

    fetchTeacher();
  }, []);

  if (!teacher) {
    return <div className="p-4 text-center text-gray-500">Loading teacher data...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white w-64 p-4 space-y-4 transform transition-transform duration-200 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 h-full`}>
        <h2 className="text-xl font-bold mb-4">📘 Teacher Panel</h2>

        {sections.map((sec) => (
          <button
            key={sec.key}
            onClick={() => {
              setSection(sec.key);
              setSidebarOpen(false); // Close on mobile
            }}
            className={`block w-full text-left px-2 py-2 rounded hover:bg-gray-700 transition ${
              section === sec.key ? 'bg-gray-700 font-semibold' : ''
            }`}
          >
            {sec.label}
          </button>
        ))}

        <button
          onClick={() => {
            localStorage.removeItem('userId');
            router.push('/login');
          }}
          className="block w-full mt-6 text-left px-2 py-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          Logout
        </button>
      </aside>

      {/* Overlay on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 w-full">
        {/* Top Bar for mobile toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">Teacher Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 border px-3 py-1 rounded"
          >
            {sidebarOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* Dynamic section rendering */}
        {section === 'profile' && <ProfileSection teacher={teacher} />}
        {section === 'students' && <StudentsSection subject={teacher.subject} />}
        {section === 'addExam' && <AddExamSection teacher={teacher} />}
        {section === 'syllabus' && <AddSyllabusSection teacher={teacher} />}
        {section === 'topic' && <TodaysTopicSection teacher={teacher} />}
        {section === 'issue' && <IssueForm role="teacher" userId={teacher.id} />}
        {section === 'scores' && <StudentScoresPanel teacher={teacher} />}
        {section === 'notification' && <NotificationsList />}
      </main>
    </div>
  );
}
