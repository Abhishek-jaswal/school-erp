'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  teacher: any;
}

export default function StudentScoresPanel({ teacher }: Props) {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: examsData } = await supabase
        .from('exams')
        .select('id, subject, exam_date, total_marks, questions')
        .eq('subject', teacher.subject)
        .order('exam_date', { ascending: false });

      const examIds = examsData?.map((e) => e.id) || [];

      const { data: submissionsData } = await supabase
        .from('exam_submissions')
        .select('id, exam_id, student_id, answers, submitted_at, students(first_name, last_name)')
        .in('exam_id', examIds);

      setExams(examsData || []);
      setSubmissions(submissionsData || []);
      setSelectedExamId(examsData?.[0]?.id || '');
      setLoading(false);
    };

    fetchData();
  }, [teacher.subject]);

  const getFilteredResults = () => {
    const exam = exams.find((e) => e.id === selectedExamId);
    if (!exam) return [];

    return submissions
      .filter((s) => s.exam_id === selectedExamId)
      .map((s) => {
        let correct = 0;
        exam.questions.forEach((q: any, i: number) => {
          if (q.answer.trim().toLowerCase() === s.answers[i]?.trim().toLowerCase()) {
            correct++;
          }
        });

        const perQ = exam.total_marks / exam.questions.length;
        const score = Math.round(correct * perQ);

        return {
          student: `${s.students.first_name} ${s.students.last_name}`,
          examDate: exam.exam_date,
          score,
          total: exam.total_marks,
          correct,
          totalQ: exam.questions.length,
        };
      });
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Student Scores - {teacher.subject}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : exams.length === 0 ? (
        <p>No exams found.</p>
      ) : (
        <>
          {/* 🔽 Dropdown to select exam */}
          <div className="mb-4">
            <label className="mr-2 font-medium">Select Exam:</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="border px-3 py-1 rounded"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_date} ({exam.subject})
                </option>
              ))}
            </select>
          </div>

          {filteredResults.length === 0 ? (
            <p className="text-gray-500">No submissions yet for this exam.</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Student</th>
                  <th className="p-2 border">Score</th>
                  <th className="p-2 border">Correct / Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r, i) => (
                  <tr key={i} className="text-center">
                    <td className="p-2 border">{r.student}</td>
                    <td className="p-2 border font-semibold text-blue-600">
                      {r.score} / {r.total}
                    </td>
                    <td className="p-2 border">{r.correct} / {r.totalQ}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
