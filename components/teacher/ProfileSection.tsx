'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Teacher } from '@/types';
import Image from 'next/image';

interface Props {
  teacher: Teacher;
}

export default function ProfileSection({ teacher }: Props) {
  const [form, setForm] = useState<Omit<Teacher, 'id' | 'email'>>({
    first_name: teacher.first_name || '',
    last_name: teacher.last_name || '',
    contact: teacher.contact || '',
    address: teacher.address || '',
    subject: teacher.subject || '',
    aadhaar: teacher.aadhaar || '',
    alternate_contact: teacher.alternate_contact || '',
    education: teacher.education || '',
    profile_image: teacher.profile_image || '',
    teacher_id:teacher.teacher_id || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${teacher.id}.${fileExt}`;

    const { error } = await supabase.storage
      .from('profile-images')
      .upload(`teachers/${fileName}`, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(`teachers/${fileName}`);

      setForm((prev) => ({ ...prev, profile_image: data.publicUrl }));
    } else {
      alert('Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const updates: Partial<Teacher> = {};

    Object.entries(form).forEach(([key, value]) => {
      if (value !== (teacher as any)[key]) {
        updates[key as keyof Teacher] = value;
      }
    });

    if (Object.keys(updates).length === 0) {
      alert('No changes detected.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', teacher.id);

    if (error) {
      alert('Update failed: ' + error.message);
    } else {
      alert('Profile updated!');
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Edit Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            First Name
          </label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter First Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Last Name
          </label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Last Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Contact
          </label>
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Contact Number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Address
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image
        </label>
        {form.profile_image && (
          <Image
            src={form.profile_image}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full object-cover mb-3"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
