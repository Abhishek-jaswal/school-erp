'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminIssuesList() {
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const { data: rawIssues } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    const teachersMap = new Map();
    const studentsMap = new Map();

    // Fetch all teachers
    const { data: teachers } = await supabase.from('teachers').select('id, first_name, last_name');
    teachers?.forEach((t) => teachersMap.set(t.id, `${t.first_name} ${t.last_name}`));

    // Fetch all students
    const { data: students } = await supabase.from('students').select('id, first_name, last_name');
    students?.forEach((s) => studentsMap.set(s.id, `${s.first_name} ${s.last_name}`));

    const enriched = rawIssues?.map((i) => ({
      ...i,
      name: i.role === 'teacher' ? teachersMap.get(i.user_id) : studentsMap.get(i.user_id),
    }));

    setIssues(enriched || []);
  };

  return (
    <div className="mt-8 bg-white border rounded p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">⚠️ All Raised Issues</h2>

      {issues.length === 0 ? (
        <p className="text-gray-500">No issues found.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Message</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, idx) => (
              <tr key={issue.id}>
                <td className="border px-3 py-2">{idx + 1}</td>
                <td className="border px-3 py-2">{issue.name || 'Unknown'}</td>
                <td className="border px-3 py-2 capitalize">{issue.role}</td>
                <td className="border px-3 py-2">{issue.type}</td>
                <td className="border px-3 py-2">{issue.message}</td>
                <td className="border px-3 py-2">{issue.status}</td>
                <td className="border px-3 py-2">
                  {new Date(issue.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
