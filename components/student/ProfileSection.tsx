'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import Image from 'next/image';

interface Teacher {
  id: string; first_name: string; last_name: string;
  contact?: string; address?: string; profile_image?: string;
  subject?: string; email?: string;
}
interface Props { teacher: Teacher; }

export default function ProfileSection({ teacher }: Props) {
  const [form, setForm] = useState({
    first_name: teacher.first_name || '',
    last_name: teacher.last_name || '',
    contact: teacher.contact || '',
    address: teacher.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    teacher.profile_image
      ? pb.files.getUrl(teacher as Parameters<typeof pb.files.getUrl>[0], teacher.profile_image)
      : ''
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('profile_image', file);
      const updated = await pb.collection('teachers').update(teacher.id, fd);
      setImageUrl(pb.files.getUrl(updated, updated['profile_image'] as string));
      alert('Image updated!');
    } catch (err: unknown) { alert('Upload failed: ' + (err as Error).message); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const updates: Record<string, string> = {};
    (Object.keys(form) as (keyof typeof form)[]).forEach(k => {
      if (form[k] !== teacher[k as keyof Teacher]) updates[k] = form[k];
    });

    if (Object.keys(updates).length === 0) {
      alert('No changes made.');
      setLoading(false);
      return;
    }
    try {
      await pb.collection('teachers').update(teacher.id, updates);
      alert('Profile updated!');
    } catch (err: unknown) { alert('Update failed: ' + (err as Error).message); }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="font-bold text-[#1e1b4b] text-xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          👤 Edit Profile
        </h2>

        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          {imageUrl ? (
            <Image src={imageUrl} alt="Profile" width={80} height={80}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {teacher.first_name?.[0]}{teacher.last_name?.[0]}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{teacher.first_name} {teacher.last_name}</p>
            <p className="text-gray-400 text-sm">{teacher.subject} · {teacher.email}</p>
            <label className="mt-2 inline-block cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
              Change photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[['first_name', 'First Name'], ['last_name', 'Last Name'], ['contact', 'Contact'], ['address', 'Address']].map(([name, label]) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
              <input name={name} value={(form as Record<string, string>)[name]} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition"
                placeholder={label} />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#1e1b4b] hover:bg-indigo-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
