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

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('syllabus')
        .select('*')
        .eq('teacher_id', teacher.id)
        .single();

      if (data) {
        setSyllabus(data.content);
        setExistingId(data.id);
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching syllabus:', error.message);
      }

      setLoading(false);
    };

    fetchSyllabus();
  }, [teacher.id]);

  const handleSave = async () => {
    if (!syllabus.trim()) {
      alert('Syllabus cannot be empty.');
      return;
    }

    setLoading(true);

    if (existingId) {
      // update
      const { error } = await supabase
        .from('syllabus')
        .update({ content: syllabus })
        .eq('id', existingId);

      if (error) alert('Update failed: ' + error.message);
      else alert('Syllabus updated successfully!');
    } else {
      // insert
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
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Add / Edit Syllabus</h2>

      <textarea
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
        rows={10}
        className="w-full border p-3 rounded resize-y"
        placeholder={`Enter syllabus for ${teacher.subject}...`}
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Saving...' : existingId ? 'Update Syllabus' : 'Save Syllabus'}
      </button>
    </div>
  );
}
