'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  student: any;
}

export default function ProfileSection({ student }: Props) {
  const [form, setForm] = useState({
    first_name: student.first_name || '',
    last_name: student.last_name || '',
    contact: student.contact || '',
    address: student.address || '',
    profile_image: student.profile_image || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${student.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(`students/${fileName}`, file, { upsert: true });

    if (uploadError) {
      alert('Failed to upload image.');
      return;
    }

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(`students/${fileName}`);

    setForm((prev) => ({ ...prev, profile_image: data.publicUrl }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const updates: any = {};
    Object.keys(form).forEach((key) => {
      if ((form as any)[key] !== (student as any)[key]) {
        updates[key] = (form as any)[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      alert('No changes made.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', student.id);

    if (error) {
      alert('Update failed: ' + error.message);
    } else {
      alert('Profile updated!');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Edit Profile</h2>

      <input
        name="first_name"
        value={form.first_name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="First Name"
      />
      <input
        name="last_name"
        value={form.last_name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Last Name"
      />
      <input
        name="contact"
        value={form.contact}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Contact"
      />
      <input
        name="address"
        value={form.address}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Address"
      />

      <div>
        <p className="mb-1 font-medium">Profile Image</p>
        {form.profile_image && (
          <img
            src={form.profile_image}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
