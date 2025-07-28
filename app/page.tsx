'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');

    // Admin login (hardcoded)
    if (username === 'admin' && password === 'admin123') {
      return router.push('/admin/dashboard');
    }

    // Student login
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (student) {
      return router.push('/student/dashboard');
    }

    // Teacher login
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (teacher) {
      return router.push('/teacher/dashboard');
    }

    // If not found
    setError('Invalid credentials. Please try again.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-800 items-center justify-center gap-4 p-8">
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 border rounded w-full max-w-xs"
      />
      <input
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        className="p-2 border rounded w-full max-w-xs"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full max-w-xs"
      >
        Login
      </button>
    </div>
  );
}
