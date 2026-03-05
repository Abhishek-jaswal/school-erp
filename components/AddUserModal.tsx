'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';

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
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const subjects = ['Math', 'English', 'Physics', 'Chemistry', 'IT'];
  const prefixMap: Record<string, string> = {
    IT: 'IT', English: 'ENG', Math: 'MATH', Physics: 'PHY', Chemistry: 'CHEM',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email)
      return alert('First name, last name, and email are required.');
    if (!form.password || form.password.length < 8)
      return alert('Password must be at least 8 characters.');

    setLoading(true);
    try {
      const prefix = prefixMap[form.subject];
      const idField = role === 'teachers' ? 'teacher_id' : 'student_id';

      // Auto-generate sequential ID (e.g. MATH001, MATH0011)
      let newId: string;
      try {
        const existing = await pb.collection(role).getFirstListItem(
          `${idField} ~ "${prefix}"`,
          { sort: `-${idField}`, fields: idField }
        );
        const lastId = (existing as Record<string, string>)[idField] || '';
        const num = parseInt(lastId.replace(/\D/g, ''), 10) || 0;
        const next = (num + 1).toString().padStart(3, '0');
        newId = role === 'teachers' ? `${prefix}${next}` : `${prefix}${next}1`;
      } catch {
        newId = role === 'teachers' ? `${prefix}001` : `${prefix}0011`;
      }

      // PocketBase Auth collection — password handled by PocketBase (no bcrypt needed)
      await pb.collection(role).create({
        email: form.email,
        password: form.password,
        passwordConfirm: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        contact: form.contact,
        address: form.address,
        aadhaar: form.aadhaar,
        alternate_contact: form.alternate_contact,
        education: form.education,
        subject: form.subject,
        [idField]: newId,
      });

      alert(`✅ ${role === 'teachers' ? 'Teacher' : 'Student'} added! ID: ${newId}`);
      onClose();
    } catch (err: unknown) {
      const pbErr = err as { data?: { data?: Record<string, { message?: string }> }; message?: string };
      if (pbErr?.data?.data) {
        const details = Object.entries(pbErr.data.data)
          .map(([f, v]) => `• ${f}: ${v.message}`)
          .join('\n');
        alert('Validation errors:\n' + details);
      } else {
        alert('Failed: ' + (err as Error).message);
      }
    }
    setLoading(false);
  };

  const fields: [string, string][] = [
    ['first_name', 'First Name'], ['last_name', 'Last Name'],
    ['email', 'Email'], ['contact', 'Contact'],
    ['address', 'Address'], ['aadhaar', 'Aadhaar'],
    ['alternate_contact', 'Alt. Contact'], ['education', 'Education'],
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1e1b4b]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Add {role === 'teachers' ? 'Teacher' : 'Student'}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">Fill in details to create a new account</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">✕</button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                {label}
                {['first_name', 'last_name', 'email'].includes(field) && <span className="text-red-400 ml-1">*</span>}
              </label>
              <input
                name={field} type={field === 'email' ? 'email' : 'text'}
                value={(form as Record<string, string>)[field]}
                onChange={handleChange} placeholder={label}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition"
              />
            </div>
          ))}

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Subject <span className="text-red-400">*</span>
            </label>
            <select name="subject" value={form.subject} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition">
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Password <span className="text-red-400">*</span>
              <span className="text-gray-400 normal-case font-normal ml-1">(min 8 chars)</span>
            </label>
            <input type="password" name="password" placeholder="Enter password"
              value={form.password} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-indigo-900 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>Saving...</>
            ) : 'Save →'}
          </button>
        </div>
      </div>
    </div>
  );
}
