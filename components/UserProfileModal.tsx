'use client';

import { useState } from 'react';
import { pb } from '@/lib/pb';
import { Teacher, Student } from '@/types';

interface UserProfileModalProps {
  user: Partial<Teacher> | Partial<Student>;
  role: 'teachers' | 'students';
  onClose: () => void;
}

export default function UserProfileModal({
  user,
  role,
  onClose,
}: UserProfileModalProps) {
  const [formData, setFormData] = useState(user);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // 🔥 PocketBase Update
      await pb.collection(role).update(user.id as string, formData);
      onClose();
    } catch (err) {
      console.error("PocketBase Update Error:", err);
    }

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Edit {role.slice(0, -1)} Profile
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            name="first_name"
            value={formData.first_name || ''}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            name="last_name"
            value={formData.last_name || ''}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            name="subject"
            value={formData.subject || ''}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            name="contact"
            value={formData.contact || ''}
            onChange={handleChange}
            placeholder="Contact"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
