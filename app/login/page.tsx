'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('admin'); // default to admin
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
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border px-4 py-2"
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
        className="border px-4 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-4 py-2"
      />

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </div>
  );
}
