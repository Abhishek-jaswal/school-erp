'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    // ✅ Admin login (hardcoded)
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('role', 'admin');
      router.push('/admin/dashboard');
      return;
    }

    // ✅ Check Teacher table
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('username', username)
      .single();

    if (teacher && await bcrypt.compare(password, teacher.password)) {
      localStorage.setItem('user', JSON.stringify(teacher));
      localStorage.setItem('role', 'teacher');
      router.push('/teacher/dashboard');
      return;
    }

    // ✅ Check Student table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('username', username)
      .single();

    if (student && await bcrypt.compare(password, student.password)) {
      localStorage.setItem('user', JSON.stringify(student));
      localStorage.setItem('role', 'student');
      router.push('/student/dashboard');
      return;
    }

    setError('Invalid username or password.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 items-center justify-center gap-4 p-8 text-white">
      <h2 className="text-xl font-semibold">School ERP Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 border border-gray-300 rounded w-full max-w-xs bg-gray-800"
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border border-gray-300 rounded w-full max-w-xs bg-gray-800"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full max-w-xs"
      >
        Login
      </button>
    </div>
  );
}
