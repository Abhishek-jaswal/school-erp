'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Teacher } from '@/types';

interface Props {
  teacher: Teacher;
}

export default function ProfileSection({ teacher }: Props) {
  const [form, setForm] = useState({
    first_name: teacher.first_name || '',
    last_name: teacher.last_name || '',
    contact: teacher.contact || '',
    address: teacher.address || '',
    profile_image: teacher.profile_image || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${teacher.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(`teachers/${fileName}`, file, { upsert: true });

    if (uploadError) {
      alert('Failed to upload image.');
      return;
    }

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(`teachers/${fileName}`);

    setForm((prev) => ({ ...prev, profile_image: data.publicUrl }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const updates: Partial<Teacher> = {};

    (Object.keys(form) as (keyof typeof form)[]).forEach((key) => {
      if (form[key] !== teacher[key]) {
        updates[key] = form[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      alert('No changes made.');
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
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="First Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Last Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact</label>
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Contact"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Address"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">Profile Image</label>
        {form.profile_image && (
          <Image
            src={form.profile_image}
            alt="Profile"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover mb-2 border"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-1 text-sm"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
