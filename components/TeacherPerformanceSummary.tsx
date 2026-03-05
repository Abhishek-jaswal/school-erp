'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface TeacherRow { id: string; teacher_id: string; first_name: string; last_name: string; subject: string; }
interface Question { answer: string; }
interface ExamRow { id: string; subject: string; total_marks: number; questions: Question[]; }
interface SubmissionRow { exam_id: string; student_id: string; answers: string[]; }
interface Performance {
  teacherName: string; subject: string;
  avgScore: number; passPercentage: number; totalStudents: number; totalExams: number;
}

export default function TeacherPerformanceSummary() {
  const [data, setData] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const teachers = await pb.collection('teachers').getFullList({
          fields: 'id,teacher_id,first_name,last_name,subject',
        }) as unknown as TeacherRow[];

        const results = await Promise.all(
          teachers.map(async (teacher) => {
            const base = {
              teacherName: `${teacher.first_name} ${teacher.last_name}`,
              subject: teacher.subject,
              avgScore: 0, passPercentage: 0, totalStudents: 0, totalExams: 0,
            };

            let exams: ExamRow[] = [];
            try {
              exams = await pb.collection('exams').getFullList({
                filter: `subject="${teacher.subject}"`,
              }) as unknown as ExamRow[];
            } catch { return { ...base }; }

            if (!exams.length) return { ...base };
            base.totalExams = exams.length;

            const allSubs: SubmissionRow[] = [];
            for (const exam of exams) {
              try {
                const subs = await pb.collection('exam_submissions').getFullList({
                  filter: `exam_id="${exam.id}"`,
                }) as unknown as SubmissionRow[];
                allSubs.push(...subs);
              } catch { /* no subs for this exam */ }
            }

            if (!allSubs.length) return { ...base };

            let totalScore = 0, passCount = 0;
            const uniqueStudents = new Set<string>();

            for (const sub of allSubs) {
              const exam = exams.find(e => e.id === sub.exam_id);
              if (!exam) continue;
              let correct = 0;
              exam.questions.forEach((q, i) => {
                if (q.answer.trim().toLowerCase() === sub.answers[i]?.trim().toLowerCase()) correct++;
              });
              const score = correct * (exam.total_marks / exam.questions.length);
              totalScore += score;
              uniqueStudents.add(sub.student_id);
              if (score >= exam.total_marks * 0.4) passCount++;
            }

            return {
              ...base,
              avgScore: Math.round((totalScore / allSubs.length) * 100) / 100,
              passPercentage: Math.round((passCount / allSubs.length) * 10000) / 100,
              totalStudents: uniqueStudents.size,
            };
          })
        );

        setData(results);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="font-bold text-[#1e1b4b] text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          📊 Teacher Performance Summary
        </h2>
        <p className="text-gray-400 text-sm mb-6">Average score and pass rate per teacher</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">No data found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {data.slice(0, 4).map((t, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                    {t.teacherName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 truncate">{t.teacherName}</p>
                  <p className="text-xs text-gray-400">{t.subject}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">{t.passPercentage}%</p>
                  <p className="text-xs text-gray-400">pass rate</p>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 80 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="teacherName" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={0} angle={-40} textAnchor="end" height={70} />
                <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={v => `${v}%`} tickCount={6} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="avgScore" fill="#4f46e5" name="Avg Score" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="passPercentage" fill="#10b981" name="Pass %" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
