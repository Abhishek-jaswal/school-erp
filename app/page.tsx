'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      router.push('/admin/dashboard')
    } else {
      // check in students or teachers table via Supabase
      // fetch role and redirect accordingly
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-800 items-center justify-center gap-4 p-8">
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        className="p-2 border rounded"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </div>
  )
}
