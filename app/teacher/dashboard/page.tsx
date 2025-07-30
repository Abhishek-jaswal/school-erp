'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: '',
    address: '',
    adharnumber: '',
    alternatenumber: '',
    education: '',
    subject: '',
    username: '',
    password: '',
    number: '',
  });
  const [preview, setPreview] = useState<string | null>(null); // for image preview only
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'teacher') {
      window.location.href = '/login';
    }

    const teacherData = localStorage.getItem('user');
    if (teacherData) {
      const parsed = JSON.parse(teacherData);
      setTeacher(parsed);
      setForm(parsed);
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!teacher) return;
    setLoading(true);

    const { error } = await supabase
      .from('teachers')
      .update(form)
      .eq('id', teacher.id);

    if (!error) {
      const updated = { ...teacher, ...form };
      setTeacher(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditMode(false);
    } else {
      alert('Failed to update');
    }
    setLoading(false);
  };

  const renderField = (label: string, name: keyof typeof form) => (
    <div>
      <label className="block text-sm font-medium">{label}:</label>
      {editMode ? (
        <input
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="w-full p-2 border rounded bg-white text-black"
        />
      ) : (
        <p>{teacher?.[name]}</p>
      )}
    </div>
  );

return (
  <div className="p-4 sm:p-6 md:p-10 max-w-4xl mx-auto">
    {teacher ? (
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-10">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Welcome, {teacher.firstname} {teacher.lastname}
        </h1>

        {/* Image & Edit */}
        <div className="flex flex-col items-center mb-6">
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover border-2 border-gray-300 rounded-full mb-3 shadow-md"
            />
          )}
          {editMode && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="text-sm text-gray-500"
            />
          )}
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
          {renderField('First Name', 'firstname')}
          {renderField('Last Name', 'lastname')}
          {renderField('Email', 'email')}
          {renderField('Contact Number', 'contact')}
          {renderField('Alternate Number', 'alternatenumber')}
          {renderField('Address', 'address')}
          {renderField('Aadhar Number', 'adharnumber')}
          {renderField('Education', 'education')}
          {renderField('Subject', 'subject')}
          {renderField('Username', 'username')}
        
          {renderField('Number', 'number')}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full text-white transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setForm(teacher);
                  setPreview(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 px-6 py-2 rounded-full text-white transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full text-white transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    ) : (
      <h1 className="text-center text-xl font-semibold mt-10">
        Loading or not logged in...
      </h1>
    )}
  </div>
);
}

