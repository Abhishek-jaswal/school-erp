'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Issue } from '@/types';

export default function AdminIssuesList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch issues on component mount
  useEffect(() => {
    fetchIssues();
  }, []);

  // Fetch all issues and enrich with teacher/student names
  const fetchIssues = async () => {
    const { data: rawIssues } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    const teachersMap = new Map();
    const studentsMap = new Map();

    // Get teacher names
    const { data: teachers } = await supabase
      .from('teachers')
      .select('id, first_name, last_name');
    teachers?.forEach((t) => {
      teachersMap.set(t.id, `${t.first_name} ${t.last_name}`);
    });

    // Get student names
    const { data: students } = await supabase
      .from('students')
      .select('id, first_name, last_name');
    students?.forEach((s) => {
      studentsMap.set(s.id, `${s.first_name} ${s.last_name}`);
    });

    // Attach names based on role
    const enriched = rawIssues?.map((i) => ({
      ...i,
      name: i.role === 'teacher'
        ? teachersMap.get(i.user_id)
        : studentsMap.get(i.user_id),
    }));

    setIssues(enriched || []);
  };

  // Update issue status to "resolved"
  const handleResolve = async (id: number) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('issues')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (error) {
      alert('Failed to update issue');
    } else {
      fetchIssues(); // Refresh list
    }
    setUpdatingId(null);
  };

  return (
    <div className="mt-8 p-4 sm:p-6 max-w-6xl mx-auto bg-white shadow rounded-md">
      <h2 className="text-2xl font-bold mb-4">⚠️ Raised Issues</h2>

      {/* Responsive table wrapper */}
      <div className="overflow-x-auto">
        {issues.length === 0 ? (
          <p className="text-gray-500">No issues found.</p>
        ) : (
          <table className="min-w-[800px] w-full text-sm border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Role</th>
                <th className="border px-3 py-2">Type</th>
                <th className="border px-3 py-2">Message</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Time</th>
                <th className="border px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, idx) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{idx + 1}</td>
                  <td className="border px-3 py-2">{issue.name || 'Unknown'}</td>
                  <td className="border px-3 py-2 capitalize">{issue.role}</td>
                  <td className="border px-3 py-2">{issue.type}</td>
                  <td className="border px-3 py-2 max-w-[200px] truncate" title={issue.message}>
                    {issue.message}
                  </td>
                  <td className="border px-3 py-2 capitalize">{issue.status}</td>
                  <td className="border px-3 py-2 whitespace-nowrap">
                    {new Date(issue.created_at).toLocaleString()}
                  </td>
                  <td className="border px-3 py-2">
                    {issue.status !== 'resolved' ? (
                      <button
                        onClick={() => handleResolve(issue.id)}
                        disabled={updatingId === issue.id}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                      >
                        {updatingId === issue.id ? 'Updating...' : 'Mark Resolved'}
                      </button>
                    ) : (
                      <span className="text-green-600 font-semibold text-xs">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
