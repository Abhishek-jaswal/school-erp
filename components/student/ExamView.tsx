'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Student , Exam } from '@/types';

interface Props {
  student: Student;
}

export default function ExamView({ student }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [submittedExamIds, setSubmittedExamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0]; // Format: yyyy-mm-dd

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);

      // Fetch exams for the student's subject
      const { data: examsData, error: examErr } = await supabase
        .from('exams')
        .select('*')
        .eq('subject', student.subject)
        .order('exam_date', { ascending: true });

      // Fetch already submitted exams by the student
      const { data: submittedData, error: subErr } = await supabase
        .from('exam_submissions')
        .select('exam_id')
        .eq('student_id', student.id);

      if (examErr || subErr) {
        console.error(examErr || subErr);
      }

      setExams(examsData || []);
      setSubmittedExamIds(submittedData?.map((d) => d.exam_id) || []);
      setLoading(false);
    };

    fetchExams();
  }, [student.id, student.subject]);

  // Redirect to exam page with student/exam context saved
  const handleStartExam = (exam: Exam) => {
    localStorage.setItem('activeExam', JSON.stringify({ exam, student }));
    window.location.href = `/student/exam/${exam.id}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Exams - {student.subject}
      </h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading exams...</p>
      ) : exams.length === 0 ? (
        <p className="text-center text-gray-500">
          No exams scheduled yet for <strong>{student.subject}</strong>.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border"> Date</th>
                <th className="px-4 py-2 border"> Duration</th>
                <th className="px-4 py-2 border"> Total Marks</th>
                <th className="px-4 py-2 border"> Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => {
                const isToday = exam.exam_date === today;
                const alreadySubmitted = submittedExamIds.includes(exam.id);

                return (
                  <tr
                    key={exam.id}
                    className="hover:bg-gray-50 text-center border-t"
                  >
                    <td className="px-4 py-2 border">{exam.exam_date}</td>
                    <td className="px-4 py-2 border">{exam.duration}</td>
                    <td className="px-4 py-2 border">{exam.total_marks}</td>
                    <td className="px-4 py-2 border">
                      {alreadySubmitted ? (
                        <span className="text-green-600 font-semibold">
                          Submitted
                        </span>
                      ) : isToday ? (
                        <button
                          onClick={() => handleStartExam(exam)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded transition"
                        >
                          Start Exam
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not available
                        </span>
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
  );
}
