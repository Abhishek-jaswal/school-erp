'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Teacher { id: string; subject: string; }
interface Question { answer: string; }
interface Exam { id: string; subject: string; exam_date: string; total_marks: number; questions: Question[]; }
interface Submission {
  id: string; exam_id: string; student_id: string; answers: string[];
  expand?: { student_id?: { first_name: string; last_name: string } };
}
interface Props { teacher: Teacher; }

export default function StudentScoresPanel({ teacher }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const examsData = await pb.collection('exams').getFullList({
          filter: `subject="${teacher.subject}"`,
          sort: '-exam_date',
        }) as unknown as Exam[];

        if (!examsData.length) { setLoading(false); return; }

        // Fetch submissions for all exams with student expand
        const allSubs: Submission[] = [];
        for (const exam of examsData) {
          try {
            const subs = await pb.collection('exam_submissions').getFullList({
              filter: `exam_id="${exam.id}"`,
              expand: 'student_id',
            }) as unknown as Submission[];
            allSubs.push(...subs);
          } catch { /* no subs for this exam */ }
        }

        setExams(examsData);
        setSubmissions(allSubs);
        setSelectedExamId(examsData[0]?.id || '');
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [teacher.subject]);

  const results = (() => {
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) return [];
    return submissions
      .filter(s => s.exam_id === selectedExamId)
      .map(s => {
        let correct = 0;
        exam.questions.forEach((q, i) => {
          if (q.answer.trim().toLowerCase() === s.answers[i]?.trim().toLowerCase()) correct++;
        });
        const score = Math.round(correct * (exam.total_marks / exam.questions.length));
        const name = s.expand?.student_id
          ? `${s.expand.student_id.first_name} ${s.expand.student_id.last_name}`
          : s.student_id;
        return { name, score, total: exam.total_marks, correct, totalQ: exam.questions.length };
      })
      .sort((a, b) => b.score - a.score);
  })();

  const maxScore = results.length ? Math.max(...results.map(r => r.score)) : 0;

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="font-bold text-[#1e1b4b] text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          📊 Student Scores
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          Subject: <span className="font-semibold text-gray-600">{teacher.subject}</span>
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : exams.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No exams found.</p>
        ) : (
          <>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Exam</label>
              <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)}
                className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition">
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.exam_date} — {exam.subject}</option>
                ))}
              </select>
            </div>

            {results.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No submissions yet for this exam.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {['Rank', 'Student', 'Score', 'Correct/Q', 'Progress'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.map((r, i) => {
                      const pct = Math.round((r.score / r.total) * 100);
                      return (
                        <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-5 py-3.5 text-gray-400 font-medium">#{i + 1}</td>
                          <td className="px-5 py-3.5 font-medium text-gray-800">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {r.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              {r.name}
                              {r.score === maxScore && i === 0 && (
                                <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-lg">🏆 Top</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-indigo-700">{r.score}</span>
                            <span className="text-gray-400">/{r.total}</span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{r.correct}/{r.totalQ}</td>
                          <td className="px-5 py-3.5 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full ${pct >= 60 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
