'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Props {
  user: Record<string, string>;
  role: 'teachers' | 'students';
  onClose: () => void;
}

export default function UserProfileModal({ user, role, onClose }: Props) {
  const [formData, setFormData] = useState({ ...user });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only send changed fields
      const updates: Record<string, string> = {};
      Object.keys(formData).forEach(k => {
        if (formData[k] !== user[k]) updates[k] = formData[k];
      });
      if (Object.keys(updates).length === 0) {
        alert('No changes made.');
        setSaving(false);
        return;
      }
      await pb.collection(role).update(user.id, updates);
      onClose();
    } catch (err: unknown) {
      alert('Update failed: ' + (err as Error).message);
    }
    setSaving(false);
  };

  const fields = [
    { name: 'first_name', label: 'First Name', type: 'text' },
    { name: 'last_name', label: 'Last Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'subject', label: 'Subject', type: 'text' },
    { name: 'contact', label: 'Contact', type: 'text' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#1e1b4b] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Edit Profile
            </h2>
            <p className="text-gray-400 text-xs mt-1 capitalize">{role.slice(0, -1)} record</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">✕</button>
        </div>

        <div className="p-6 space-y-3">
          {fields.map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type} name={name} value={formData[name] || ''} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-indigo-900 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
