'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Student { id: string; subject: string; }
interface Exam {
  id: string; exam_date: string; duration: string; total_marks: number;
  subject: string; questions: { question: string; options: string[]; answer: string }[];
}
interface Props { student: Student; }

export default function ExamView({ student }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [submittedExamIds, setSubmittedExamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [examsData, submittedData] = await Promise.all([
          pb.collection('exams').getFullList({
            filter: `subject="${student.subject}"`,
            sort: 'exam_date',
          }),
          pb.collection('exam_submissions').getFullList({
            filter: `student_id="${student.id}"`,
            fields: 'exam_id',
          }),
        ]);
        setExams(examsData as unknown as Exam[]);
        setSubmittedExamIds(submittedData.map(d => d['exam_id'] as string));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [student.id, student.subject]);

  const handleStartExam = (exam: Exam) => {
    localStorage.setItem('activeExam', JSON.stringify({ exam, student }));
    window.location.href = `/student/exam/${exam.id}`;
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-[#1e1b4b] text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            📝 Exams — {student.subject}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{exams.length} exam{exams.length !== 1 ? 's' : ''} scheduled</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : exams.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">No exams scheduled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {['Date', 'Duration', 'Total Marks', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exams.map(exam => {
                  const isToday = exam.exam_date === today;
                  const submitted = submittedExamIds.includes(exam.id);
                  return (
                    <tr key={exam.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800">{exam.exam_date}</td>
                      <td className="px-5 py-4 text-gray-500">{exam.duration}</td>
                      <td className="px-5 py-4 text-gray-500">{exam.total_marks}</td>
                      <td className="px-5 py-4">
                        {submitted ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                            ✓ Submitted
                          </span>
                        ) : isToday ? (
                          <button onClick={() => handleStartExam(exam)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shadow-sm">
                            Start Exam →
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Not yet available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
