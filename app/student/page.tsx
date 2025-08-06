'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProfileSection from '@/components/student/ProfileSection';
import SyllabusView from '@/components/student/SyllabusView';
import ExamView from '@/components/student/ExamView';
import IssueForm from '@/components/IssueForm';
import NotificationsList from '@/components/NotificationsList';

export default function StudentDashboard() {
  const [section, setSection] = useState('profile');
  const [student, setStudent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/login');
      return;
    }

    const fetchStudent = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (data) setStudent(data);
      else console.error(error);
    };

    fetchStudent();
  }, []);

  if (!student) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Student Panel</h2>
        <button onClick={() => setSection('profile')} className="block w-full text-left">Profile</button>
        <button onClick={() => setSection('syllabus')} className="block w-full text-left">Syllabus</button>
        <button onClick={() => setSection('exams')} className="block w-full text-left">Exams</button>
        <button onClick={() => setSection('issue')} className="block w-full text-left">Raise Issue</button>
                <button onClick={() => setSection('notification')} className="block w-full text-left">Notifications</button>
        <button onClick={() => router.push('/login')} className="block w-full text-left">Logout</button>
      </div>

      {/* Main Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        {section === 'profile' && <ProfileSection student={student} />}
        {section === 'syllabus' && <SyllabusView subject={student.subject} />}
        {section === 'exams' && <ExamView student={student} />}
        {section === 'issue' && <IssueForm role="student" userId={student.id} />}
        {section === 'notification' && <NotificationsList/>}
      </div>
    </div>
  );
}
