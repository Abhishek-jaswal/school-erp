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

  // Fetch exams and their related submissions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Get exams for teacher's subject
      const { data: examsData } = await supabase
        .from('exams')
        .select('id, subject, exam_date, total_marks, questions')
        .eq('subject', teacher.subject)
        .order('exam_date', { ascending: false });

      const examIds = examsData?.map((e) => e.id) || [];

      // Get all submissions for those exams
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

  // Filter and calculate scores for selected exam
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        Student Scores - <span className="text-indigo-600">{teacher.subject}</span>
      </h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : exams.length === 0 ? (
        <div className="text-center text-gray-600">No exams found.</div>
      ) : (
        <>
          {/* Exam selection dropdown */}
          <div className="mb-6">
            <label className="mr-2 font-medium">Select Exam:</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="border px-4 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-400"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_date} ({exam.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Score Table */}
          {filteredResults.length === 0 ? (
            <p className="text-gray-500">No submissions yet for this exam.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm sm:text-base border border-gray-300">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 border">Student</th>
                    <th className="p-3 border">Score</th>
                    <th className="p-3 border">Correct / Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((r, i) => (
                    <tr
                      key={i}
                      className={`text-center ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-indigo-50 transition`}
                    >
                      <td className="p-3 border">{r.student}</td>
                      <td className="p-3 border font-semibold text-indigo-700">
                        {r.score} / {r.total}
                      </td>
                      <td className="p-3 border">{r.correct} / {r.totalQ}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
