'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (role === 'admin') {
      if (email === 'admin' && password === 'admin123') {
        localStorage.setItem('role', 'admin');
        router.push('/admin');
      } else {
        alert('Invalid admin credentials');
      }
    } else {
      const { data, error } = await supabase
        .from(role === 'teacher' ? 'teachers' : 'students')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        alert('User not found');
        return;
      }

      const match = await bcrypt.compare(password, data.password);
      if (!match) {
        alert('Invalid password');
        return;
      }

      localStorage.setItem('role', role);
      localStorage.setItem('userId', data.id);
      router.push(`/${role}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">Login</h1>

        <div className="flex flex-col gap-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          <input
            type="text"
            placeholder="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded shadow-md"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
