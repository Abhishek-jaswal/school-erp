'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Props { subject: string; }

export default function SyllabusView({ subject }: Props) {
  const [syllabus, setSyllabus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const result = await pb.collection('syllabus').getFirstListItem(
          `subject="${subject}"`,
          { sort: '-created' }
        );
        setSyllabus(result['content'] as string || null);
      } catch {
        setSyllabus(null);
      }
      setLoading(false);
    };
    fetchSyllabus();
  }, [subject]);

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="font-bold text-[#1e1b4b] text-xl mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          📚 Syllabus — {subject}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : syllabus ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {syllabus}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">📭</span>
            <p className="text-gray-400 text-sm">No syllabus uploaded yet for {subject}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
