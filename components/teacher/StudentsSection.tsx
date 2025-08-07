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

  // Fetch students related to a specific subject
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

  // Toggle expandable section for student details
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Loading state
  if (loading) return <p className="text-gray-600 text-center py-4">Loading students...</p>;

  // No students found
  if (students.length === 0)
    return (
      <p className="text-center text-gray-600 py-4">
        No students found for <strong>{subject}</strong>.
      </p>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Students Enrolled in <span className="text-blue-600">{subject}</span>
      </h2>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm border rounded shadow">
          <thead className="bg-gray-100 text-gray-700 font-medium">
            <tr>
              <th className="px-4 py-3 border">Name</th>
              <th className="px-4 py-3 border">Email</th>
              <th className="px-4 py-3 border">Contact</th>
              <th className="px-4 py-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu) => (
              <tr key={stu.id} className="text-center hover:bg-gray-50 transition">
                {/* Student Basic Info */}
                <td className="px-4 py-2 border">
                  {stu.first_name} {stu.last_name}
                </td>
                <td className="px-4 py-2 border">{stu.email}</td>
                <td className="px-4 py-2 border">{stu.contact}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => toggleExpand(stu.id)}
                    className="text-blue-600 underline hover:text-blue-800 transition"
                  >
                    {expandedId === stu.id ? 'Hide' : 'View'}
                  </button>
                </td>
              </tr>
            ))}

            {/* Expanded Details Row */}
            {students.map(
              (stu) =>
                expandedId === stu.id && (
                  <tr key={`expanded-${stu.id}`}>
                    <td colSpan={4} className="bg-gray-50 px-6 py-4 text-left border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 text-sm">
                        <p>
                          <strong>Address:</strong> {stu.address}
                        </p>
                        <p>
                          <strong>Aadhaar:</strong> {stu.aadhaar}
                        </p>
                        <p>
                          <strong>Alt Contact:</strong> {stu.alternate_contact}
                        </p>
                        <p>
                          <strong>Education:</strong> {stu.education}
                        </p>
                        <p>
                          <strong>Student ID:</strong> {stu.student_id}
                        </p>
                        <p>
                          <strong>Registered:</strong>{' '}
                          {new Date(stu.created_at).toLocaleString()}
                        </p>
                      </div>
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
