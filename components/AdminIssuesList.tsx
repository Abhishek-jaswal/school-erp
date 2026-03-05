'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

type Issue = {
  id: string; user_id: string; role: string; type: string;
  message: string; status: string; created: string; name?: string;
};

export default function AdminIssuesList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { fetchIssues(); }, []);

  const fetchIssues = async () => {
    try {
      const raw = await pb.collection('issues').getFullList({ sort: '-created' }) as unknown as Issue[];

      const [teachers, students] = await Promise.all([
        pb.collection('teachers').getFullList({ fields: 'id,first_name,last_name' }),
        pb.collection('students').getFullList({ fields: 'id,first_name,last_name' }),
      ]);

      const teacherMap = new Map(teachers.map(t => [t.id, `${t['first_name']} ${t['last_name']}`]));
      const studentMap = new Map(students.map(s => [s.id, `${s['first_name']} ${s['last_name']}`]));

      setIssues(raw.map(i => ({
        ...i,
        name: i.role === 'teacher' ? teacherMap.get(i.user_id) : studentMap.get(i.user_id),
      })));
    } catch (err) { console.error(err); }
  };

  const handleResolve = async (id: string) => {
    setUpdatingId(id);
    try {
      await pb.collection('issues').update(id, { status: 'resolved' });
      fetchIssues();
    } catch { alert('Failed to update issue'); }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-[#1e1b4b] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            ⚠️ Raised Issues
          </h2>
          <p className="text-gray-400 text-sm mt-1">{issues.length} total</p>
        </div>

        <div className="overflow-x-auto">
          {issues.length === 0 ? (
            <p className="px-6 py-12 text-center text-gray-400 text-sm">No issues found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {['#', 'Name', 'Role', 'Type', 'Message', 'Status', 'Time', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {issues.map((issue, idx) => (
                  <tr key={issue.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{issue.name || 'Unknown'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${issue.role === 'teacher' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                        {issue.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{issue.type}</td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate" title={issue.message}>{issue.message}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${issue.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap text-xs">{new Date(issue.created).toLocaleString()}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {issue.status !== 'resolved' ? (
                        <button onClick={() => handleResolve(issue.id)} disabled={updatingId === issue.id}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50 font-medium">
                          {updatingId === issue.id ? 'Updating...' : '✓ Resolve'}
                        </button>
                      ) : (
                        <span className="text-green-600 text-xs font-semibold">✓ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
