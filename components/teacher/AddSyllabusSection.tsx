'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  teacher: any;
}

export default function AddSyllabusSection({ teacher }: Props) {
  const [syllabus, setSyllabus] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing syllabus for the current teacher
  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('syllabus')
        .select('*')
        .eq('teacher_id', teacher.id)
        .single();

      // If data exists, set it to state
      if (data) {
        setSyllabus(data.content);
        setExistingId(data.id);
      }

      // Ignore "no rows" error (PGRST116), log other errors
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching syllabus:', error.message);
      }

      setLoading(false);
    };

    fetchSyllabus();
  }, [teacher.id]);

  // Handle save or update action
  const handleSave = async () => {
    if (!syllabus.trim()) {
      alert('Syllabus cannot be empty.');
      return;
    }

    setLoading(true);

    if (existingId) {
      // Update existing syllabus
      const { error } = await supabase
        .from('syllabus')
        .update({ content: syllabus })
        .eq('id', existingId);

      if (error) alert('Update failed: ' + error.message);
      else alert('Syllabus updated successfully!');
    } else {
      // Insert new syllabus
      const { error } = await supabase.from('syllabus').insert([
        {
          teacher_id: teacher.id,
          subject: teacher.subject,
          content: syllabus,
        },
      ]);

      if (error) alert('Save failed: ' + error.message);
      else alert('Syllabus saved!');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 bg-white shadow rounded-lg">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800">
        {existingId ? 'Edit Syllabus' : 'Add Syllabus'}
      </h2>

      {/* Subject Info */}
      <p className="text-sm text-gray-600">
        Subject: <span className="font-semibold">{teacher.subject}</span>
      </p>

      {/* Syllabus Text Area */}
      <textarea
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
        rows={10}
        placeholder={`Enter syllabus for ${teacher.subject}...`}
        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Save/Update Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition disabled:opacity-60"
        >
          {loading
            ? 'Saving...'
            : existingId
            ? 'Update Syllabus'
            : 'Save Syllabus'}
        </button>
      </div>
    </div>
  );
}
