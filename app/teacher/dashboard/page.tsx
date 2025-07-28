'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.auth.getUser()
      const { data: profileData } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', data.user?.id)
        .single()
      setProfile(profileData)
    }
    fetchProfile()
  }, [])

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">👤 Profile</h1>
      {profile && (
        <div className="space-y-4">
          <div><strong>Name:</strong> {profile.name}</div>
          <div><strong>Contact:</strong> {profile.contact}</div>
          <div><strong>Address:</strong> {profile.address}</div>
          <div>
            <strong>Profile Picture:</strong><br />
            <img src={profile.avatar_url} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
          </div>
        </div>
      )}
    </div>
  )
}
