'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setIssues(data);
      } else {
        console.error('Failed to fetch issues:', error);
      }

      setLoading(false);
    };

    fetchIssues();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <main className="flex-1 p-4 md:p-6 w-full bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-200">
            Reported Issues
          </h1>

          <div className="bg-gray-800 shadow-md rounded-lg p-4 overflow-x-auto">
            {loading ? (
              <p className="text-gray-400">Loading issues...</p>
            ) : issues.length === 0 ? (
              <p className="text-gray-400">No issues reported yet.</p>
            ) : (
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-700 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2">S.No</th>
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Subject</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Message</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue, index) => (
                    <tr key={issue.id} className="border-b border-gray-700">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{issue.username}</td>
                      <td className="px-4 py-2">{issue.subject}</td>
                      <td className="px-4 py-2">{issue.type}</td>
                      <td className="px-4 py-2">{issue.message}</td>
                      <td className="px-4 py-2">{issue.status}</td>
                      <td className="px-4 py-2">
                        {new Date(issue.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
