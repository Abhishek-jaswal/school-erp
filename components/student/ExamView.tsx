'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  student: any;
}

export default function ExamView({ student }: Props) {
  const [exams, setExams] = useState<any[]>([]);
  const [submittedExamIds, setSubmittedExamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);

      const { data: examsData, error: examErr } = await supabase
        .from('exams')
        .select('*')
        .eq('subject', student.subject)
        .order('exam_date', { ascending: true });

      const { data: submittedData, error: subErr } = await supabase
        .from('exam_submissions')
        .select('exam_id')
        .eq('student_id', student.id);

      if (examErr) console.error(examErr);
      if (subErr) console.error(subErr);

      setExams(examsData || []);
      setSubmittedExamIds(submittedData?.map((d) => d.exam_id) || []);
      setLoading(false);
    };

    fetchExams();
  }, [student.id]);

  const handleStartExam = (exam: any) => {
    // Save to localStorage to continue exam in another component/page
    localStorage.setItem('activeExam', JSON.stringify({ exam, student }));
    window.location.href = `/student/exam/${exam.id}`;
  };

  if (loading) return <p>Loading exams...</p>;

  if (exams.length === 0)
    return <p>No exams scheduled yet for {student.subject}.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Exams - {student.subject}</h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Duration</th>
            <th className="border p-2">Total Marks</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => {
            const isToday = exam.exam_date === today;
            const alreadySubmitted = submittedExamIds.includes(exam.id);

            return (
              <tr key={exam.id} className="text-center">
                <td className="border p-2">{exam.exam_date}</td>
                <td className="border p-2">{exam.duration}</td>
                <td className="border p-2">{exam.total_marks}</td>
                <td className="border p-2">
                  {alreadySubmitted ? (
                    <span className="text-green-600 font-medium">Submitted</span>
                  ) : isToday ? (
                    <button
                      onClick={() => handleStartExam(exam)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Start Exam
                    </button>
                  ) : (
                    <span className="text-gray-400 italic">Not available</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
