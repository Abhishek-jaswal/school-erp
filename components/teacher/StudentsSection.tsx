'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  subject: string;
}

export default function StudentsSection({ subject }: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch students:', error);
      } else {
        setStudents(data || []);
      }
      setLoading(false);
    };

    fetchStudents();
  }, [subject]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) return <p>Loading students...</p>;

  if (students.length === 0)
    return <p className="text-gray-600">No students found for {subject}.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Students ({subject})</h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">Contact</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <>
              <tr key={stu.id} className="text-center">
                <td className="border px-2 py-1">{stu.first_name} {stu.last_name}</td>
                <td className="border px-2 py-1">{stu.email}</td>
                <td className="border px-2 py-1">{stu.contact}</td>
                <td className="border px-2 py-1">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => toggleExpand(stu.id)}
                  >
                    {expandedId === stu.id ? 'Hide' : 'View'}
                  </button>
                </td>
              </tr>

              {/* Expandable Section */}
              {expandedId === stu.id && (
                <tr>
                  <td colSpan={4} className="border px-3 py-2 bg-gray-100 text-left">
                    <div className="space-y-1 text-sm">
                      <p><strong>Address:</strong> {stu.address}</p>
                      <p><strong>Aadhaar:</strong> {stu.aadhaar}</p>
                      <p><strong>Alt Contact:</strong> {stu.alternate_contact}</p>
                      <p><strong>Education:</strong> {stu.education}</p>
                      <p><strong>Student ID:</strong> {stu.student_id}</p>
                      <p><strong>Registered:</strong> {new Date(stu.created_at).toLocaleString()}</p>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
