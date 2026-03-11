'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Teacher { id: string; subject: string; }
interface Props { teacher: Teacher; }

export default function AddSyllabusSection({ teacher }: Props) {
  const [syllabus, setSyllabus] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const data = await pb.collection('syllabus').getFirstListItem(
          `teacher_id="${teacher.id}"`, { sort: '-created' }
        );
        setSyllabus(data['content'] as string || '');
        setExistingId(data.id);
      } catch {
        // No syllabus yet — fine
      }
      setLoading(false);
    };
    fetchSyllabus();
  }, [teacher.id]);

  const handleSave = async () => {
    if (!syllabus.trim()) return alert('Syllabus cannot be empty.');
    setLoading(true);
    try {
      if (existingId) {
        await pb.collection('syllabus').update(existingId, { content: syllabus });
        alert('Syllabus updated successfully!');
      } else {
        const record = await pb.collection('syllabus').create({
          teacher_id: teacher.id,
          subject: teacher.subject,
          content: syllabus,
        });
        setExistingId(record.id);
        alert('Syllabus saved!');
      }
    } catch (err: unknown) {
      alert('Failed: ' + (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="font-bold text-[#1e1b4b] text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          {existingId ? '✏️ Edit Syllabus' : '📚 Add Syllabus'}
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          Subject: <span className="font-semibold text-gray-600">{teacher.subject}</span>
        </p>

        {loading && !syllabus ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <textarea
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              rows={10}
              placeholder={`Enter syllabus content for ${teacher.subject}...`}
              className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white resize-y transition"
            />
            <div className="flex justify-end mt-4">
              <button onClick={handleSave} disabled={loading}
                className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-[#1e1b4b] hover:bg-indigo-900'}`}>
                {loading ? 'Saving...' : existingId ? 'Update Syllabus' : 'Save Syllabus →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
