'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

interface Props {
  role: 'teachers' | 'students';
  onClose: () => void;
}
type TeacherOrStudent = {
  teacher_id?: string;
  student_id?: string;
};

export default function AddUserModal({ role, onClose }: Props) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact: '',
    address: '',
    aadhaar: '',
    alternate_contact: '',
    education: '',
    subject: 'Math',
    password: ''
  });

  const subjects = ['Math', 'English', 'Physics', 'Chemistry', 'IT'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.password) return alert('Password required');
    const hashedPassword = await bcrypt.hash(form.password, 10);

    const prefixMap: Record<string, string> = {
      IT: 'IT',
      English: 'ENG',
      Math: 'MATH',
      Physics: 'PHY',
      Chemistry: 'CHEM',
    };

    const prefix = prefixMap[form.subject];
    const idField = `${role.slice(0, -1)}_id`; // teacher_id or student_id

    const { data: existing, error: fetchError } = await supabase
      .from(role)
      .select(idField)
      .ilike(idField, `${prefix}%`)
      .order(idField, { ascending: false })
      .limit(1);

    if (fetchError) {
      alert('Error checking IDs: ' + fetchError.message);
      return;
    }

    let newId: string;
    if (!existing || existing.length === 0) {
      newId = role === 'teachers' ? `${prefix}001` : `${prefix}0011`;
    } else {
const lastId = (existing[0] as TeacherOrStudent)[idField as keyof TeacherOrStudent]!;
const num = parseInt(lastId.replace(/\D/g, ''), 10);

      const nextNum = (num + 1).toString().padStart(3, '0');
      newId = role === 'teachers' ? `${prefix}${nextNum}` : `${prefix}${nextNum}1`;
    }

    const { error } = await supabase.from(role).insert([
      {
        ...form,
        [idField]: newId,
        password: hashedPassword,
      },
    ]);

    if (error) {
      alert('Failed to add: ' + error.message);
    } else {
      alert(`${role.slice(0, -1)} added with ID: ${newId}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg mx-4 p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Add {role.slice(0, -1).toUpperCase()}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(form).map(([field, value]) =>
            field !== 'password' && field !== 'subject' ? (
              <input
                key={field}
                name={field}
                value={value}
                onChange={handleChange}
                placeholder={field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
              />
            ) : null
          )}

          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full col-span-1 sm:col-span-2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
          >
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full col-span-1 sm:col-span-2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
