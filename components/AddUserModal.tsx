'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

interface Props {
  role: 'teachers' | 'students';
  onClose: () => void;
}

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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  if (!form.password) return alert('Password required');
  const hashedPassword = await bcrypt.hash(form.password, 10);

  // Step 1: Create a subject → prefix map
  const prefixMap: any = {
    IT: 'IT',
    English: 'ENG',
    Math: 'MATH',
    Physics: 'PHY',
    Chemistry: 'CHEM',
  };

  const prefix = prefixMap[form.subject];
  const idField = `${role.slice(0, -1)}_id`; // 'teacher_id' or 'student_id'

  // Step 2: Fetch the last matching ID
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

  // Step 3: Generate new ID
  let newId: string;
  if (!existing || existing.length === 0) {
    newId = role === 'teachers' ? `${prefix}001` : `${prefix}0011`;
  } else {
    const lastId = existing[0][idField];
    const num = parseInt(lastId.replace(/\D/g, ''), 10);
    const nextNum = (num + 1).toString().padStart(3, '0');
    newId = role === 'teachers' ? `${prefix}${nextNum}` : `${prefix}${nextNum}1`;
  }

  // Step 4: Insert with auto-generated ID
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-[500px] space-y-4">
        <h2 className="text-xl font-bold">Add {role.slice(0, -1)}</h2>
        {Object.keys(form).map((field) => (
          field !== 'password' ? (
            <input
              key={field}
              name={field}
              value={(form as any)[field]}
              onChange={handleChange}
              placeholder={field.replace('_', ' ')}
              className="w-full px-3 py-2 border rounded mb-2"
            />
          ) : null
        ))}
        <select name="subject" value={form.subject} onChange={handleChange} className="w-full border px-3 py-2 rounded">
          {subjects.map((subj) => (
            <option key={subj} value={subj}>{subj}</option>
          ))}
        </select>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}
