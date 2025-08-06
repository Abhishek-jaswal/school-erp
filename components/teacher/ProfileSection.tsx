'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  teacher: any;
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
    const { error } = await supabase.storage
      .from('profile-images') // Make sure this bucket exists
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

    // Only update changed fields (space/time efficient)
    const updates: any = {};
    Object.keys(form).forEach((key) => {
      if ((form as any)[key] !== (teacher as any)[key]) {
        updates[key] = (form as any)[key];
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

      {/* Profile Image */}
      <div>
        <p className="mb-1 font-medium">Profile Image</p>
        {form.profile_image && (
          <img
            src={form.profile_image}
            alt="Profile"
            className="w-24 h-24 rounded-full mb-2 object-cover"
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
