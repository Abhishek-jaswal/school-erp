'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your credentials.');
      return;
    }
    setLoading(true);

    try {
      if (role === 'admin') {
        if (email === 'admin' && password === 'admin123') {
          localStorage.setItem('role', 'admin');
          router.push('/admin');
        } else {
          setError('Invalid admin credentials.');
        }
        setLoading(false);
        return;
      }

      // PocketBase auth for teacher / student
      const collection = role === 'teacher' ? 'teachers' : 'students';
      const authData = await pb.collection(collection).authWithPassword(email, password);

      if (!authData?.record?.id) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Store both role and userId
      localStorage.setItem('role', role);
      localStorage.setItem('userId', authData.record.id);

      // Navigate to the correct dashboard
      router.push(`/${role}`);
    } catch (err: unknown) {
      const msg = (err as { status?: number; message?: string });
      if (msg?.status === 400 || msg?.status === 401) {
        setError('Invalid email or password.');
      } else if (msg?.status === 0) {
        setError('Cannot connect to server. Make sure PocketBase is running.');
      } else {
        setError(msg?.message || 'Login failed. Please try again.');
      }
    }

    setLoading(false);
  };

  const roles = [
    { value: 'admin', label: 'Admin', icon: '🛠', color: 'from-violet-600 to-indigo-600' },
    { value: 'teacher', label: 'Teacher', icon: '📘', color: 'from-blue-600 to-cyan-600' },
    { value: 'student', label: 'Student', icon: '🎓', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-2xl shadow-amber-500/30">
            <span className="text-3xl">🏫</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            EduTrack
          </h1>
          <p className="text-white/40 text-sm mt-1">Your personalized learning portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => { setRole(r.value); setError(''); }}
                className={`flex flex-col items-center py-3 px-2 rounded-2xl text-xs font-semibold transition-all duration-200 ${role === r.value
                    ? `bg-gradient-to-br ${r.color} text-white shadow-lg scale-105`
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                  }`}
              >
                <span className="text-lg mb-1">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                {role === 'admin' ? 'Username' : 'Email'}
              </label>
              <input
                type={role === 'admin' ? 'text' : 'email'}
                placeholder={role === 'admin' ? 'admin' : 'you@school.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoComplete="username"
                className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoComplete="current-password"
                className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : `Sign In as ${roles.find(r => r.value === role)?.label} →`}
            </button>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          EduTrack © {new Date().getFullYear()} — Powered by PocketBase
        </p>
      </div>
    </div>
  );
}
