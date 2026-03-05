'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Student {
  id: string; first_name: string; last_name: string; email: string;
  contact?: string; address?: string; aadhaar?: string;
  alternate_contact?: string; education?: string; student_id?: string; created: string;
}
interface Props { subject: string; }

export default function StudentsSection({ subject }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await pb.collection('students').getFullList({
          filter: `subject="${subject}"`,
          sort: '-created',
        });
        setStudents(data as unknown as Student[]);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchStudents();
  }, [subject]);

  const filtered = students.filter(s => {
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#1e1b4b] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              🎓 Students — {subject}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">{students.length} enrolled</p>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" placeholder="Search students..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56 transition" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">
            {students.length === 0 ? `No students enrolled in ${subject}.` : 'No matching students.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {['Name', 'Email', 'Contact', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(stu => (
                  <>
                    <tr key={stu.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {stu.first_name?.[0]}{stu.last_name?.[0]}
                          </div>
                          {stu.first_name} {stu.last_name}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{stu.email}</td>
                      <td className="px-5 py-3.5 text-gray-500">{stu.contact || '—'}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setExpandedId(prev => prev === stu.id ? null : stu.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${expandedId === stu.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                          {expandedId === stu.id ? '▲ Hide' : '▼ Details'}
                        </button>
                      </td>
                    </tr>

                    {expandedId === stu.id && (
                      <tr key={`exp-${stu.id}`}>
                        <td colSpan={4} className="px-5 py-4 bg-indigo-50/30 border-t border-indigo-100">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              ['Address', stu.address],
                              ['Aadhaar', stu.aadhaar],
                              ['Alt Contact', stu.alternate_contact],
                              ['Education', stu.education],
                              ['Student ID', stu.student_id],
                              ['Registered', new Date(stu.created).toLocaleString()],
                            ].map(([label, val]) => (
                              <div key={label} className="bg-white rounded-xl px-3 py-2 border border-gray-100">
                                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                                <p className="text-gray-700 font-medium text-xs">{val || '—'}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
