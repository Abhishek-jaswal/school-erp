'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  subject: string;
}

export default function SyllabusView({ subject }: Props) {
  const [syllabus, setSyllabus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('syllabus')
        .select('content')
        .eq('subject', subject)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch syllabus:', error.message);
      } else {
        setSyllabus(data?.content || null);
      }

      setLoading(false);
    };

    fetchSyllabus();
  }, [subject]);

  if (loading) return <p>Loading syllabus...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Syllabus - {subject}</h2>

      {syllabus ? (
        <div className="bg-white border p-4 rounded shadow-sm whitespace-pre-wrap">
          {syllabus}
        </div>
      ) : (
        <p className="text-gray-500">No syllabus uploaded yet.</p>
      )}
    </div>
  );
}
