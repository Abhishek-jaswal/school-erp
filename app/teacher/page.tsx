'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProfileSection from '@/components/teacher/ProfileSection';
import StudentsSection from '@/components/teacher/StudentsSection';
import AddExamSection from '@/components/teacher/AddExamSection';
import AddSyllabusSection from '@/components/teacher/AddSyllabusSection';
import TodaysTopicSection from '@/components/teacher/TodaysTopicSection';
import IssueForm from '@/components/IssueForm';

export default function TeacherDashboard() {
  const [section, setSection] = useState('profile');
  const [teacher, setTeacher] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/login');
      return;
    }

    // Fetch logged-in teacher
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

  if (!teacher) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Teacher Panel</h2>
        <button onClick={() => setSection('profile')} className="block w-full text-left">Profile</button>
        <button onClick={() => setSection('students')} className="block w-full text-left">Students</button>
        <button onClick={() => setSection('addExam')} className="block w-full text-left">Add Exam</button>
        <button onClick={() => setSection('syllabus')} className="block w-full text-left">Add Syllabus</button>
        <button onClick={() => setSection('topic')} className="block w-full text-left">Today’s Topic</button>
        <button onClick={() => setSection('issue')} className="block w-full text-left">Raise Issue</button>
        <button onClick={() => router.push('/login')} className="block w-full text-left">Logout</button>
      </div>

      {/* Section View */}
      <div className="flex-1 p-6 overflow-y-auto">
        {section === 'profile' && <ProfileSection teacher={teacher} />}
        {section === 'students' && <StudentsSection subject={teacher.subject} />}
        {section === 'addExam' && <AddExamSection teacher={teacher} />}
        {section === 'syllabus' && <AddSyllabusSection teacher={teacher} />}
        {section === 'topic' && <TodaysTopicSection teacher={teacher} />}
        {section === 'issue' && <IssueForm role="teacher" userId={teacher.id} />}
      </div>
    </div>
  );
}
