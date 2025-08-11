'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Teacher, Exam, Submission } from '@/types';

interface TeacherPerformance {
  teacherId: string;
  teacherName: string;
  subject: string;
  avgScore: number;
  passPercentage: number;
  totalStudents: number;
  totalExams: number;
}

export default function TeacherPerformanceSummary() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [performanceData, setPerformanceData] = useState<TeacherPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachersAndPerformance = async () => {
      setLoading(true);

      // Fetch all teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from<Teacher>('teachers')
        .select('teacher_id, first_name, last_name, subject');

      if (teachersError || !teachersData) {
        setLoading(false);
        console.error('Error fetching teachers:', teachersError);
        return;
      }
      setTeachers(teachersData);

      const results: TeacherPerformance[] = [];

      for (const teacher of teachersData) {
        // Fetch exams by subject taught by teacher
        const { data: examsData } = await supabase
          .from<Exam>('exams')
          .select('id, subject, exam_date, total_marks, questions')
          .eq('subject', teacher.subject);

        if (!examsData || examsData.length === 0) {
          results.push({
            teacherId: teacher.teacher_id,
            teacherName: `${teacher.first_name} ${teacher.last_name}`,
            subject: teacher.subject,
            avgScore: 0,
            passPercentage: 0,
            totalStudents: 0,
            totalExams: 0,
          });
          continue;
        }

        const examIds = examsData.map((e) => e.id);

        // Fetch submissions for those exams
        const { data: submissionsData } = await supabase
          .from<Submission>('exam_submissions')
          .select('id, exam_id, student_id, answers')
          .in('exam_id', examIds);

        if (!submissionsData || submissionsData.length === 0) {
          results.push({
            teacherId: teacher.teacher_id,
            teacherName: `${teacher.first_name} ${teacher.last_name}`,
            subject: teacher.subject,
            avgScore: 0,
            passPercentage: 0,
            totalStudents: 0,
            totalExams: examsData.length,
          });
          continue;
        }

        let totalScoreSum = 0;
        let passCount = 0;
        const passingMarksRatio = 0.4; // 40% pass mark
        const uniqueStudents = new Set<string>();

        for (const submission of submissionsData) {
          const exam = examsData.find((e) => e.id === submission.exam_id);
          if (!exam) continue;

          // Calculate correct answers
          let correctCount = 0;
          exam.questions.forEach((q, i) => {
            if (q.answer.trim().toLowerCase() === submission.answers[i]?.trim().toLowerCase()) {
              correctCount++;
            }
          });

          const perQMark = exam.total_marks / exam.questions.length;
          const score = correctCount * perQMark;
          totalScoreSum += score;
          uniqueStudents.add(submission.student_id);

          if (score >= exam.total_marks * passingMarksRatio) {
            passCount++;
          }
        }

        const avgScore = totalScoreSum / submissionsData.length;
        const passPercentage = (passCount / submissionsData.length) * 100;

        results.push({
          teacherId: teacher.teacher_id,
          teacherName: `${teacher.first_name} ${teacher.last_name}`,
          subject: teacher.subject,
          avgScore: Math.round(avgScore * 100) / 100,
          passPercentage: Math.round(passPercentage * 100) / 100,
          totalStudents: uniqueStudents.size,
          totalExams: examsData.length,
        });
      }

      setPerformanceData(results);
      setLoading(false);
    };

    fetchTeachersAndPerformance();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Teacher Performance Summary</h2>

      {loading ? (
        <p className="text-gray-600">Loading performance data...</p>
      ) : performanceData.length === 0 ? (
        <p className="text-gray-500">No teacher data found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300 text-left text-sm sm:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Teacher</th>
                <th className="p-3 border">Subject</th>
                <th className="p-3 border">Avg. Score</th>
                <th className="p-3 border">Pass %</th>
                <th className="p-3 border">Total Students</th>
                <th className="p-3 border">Total Exams</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((tp) => (
                <tr
                  key={tp.teacherId}
                  className="border-t border-gray-300 hover:bg-indigo-50 transition"
                >
                  <td className="p-3 border">{tp.teacherName}</td>
                  <td className="p-3 border">{tp.subject}</td>
                  <td className="p-3 border font-semibold">{tp.avgScore}</td>
                  <td className="p-3 border">{tp.passPercentage.toFixed(2)}%</td>
                  <td className="p-3 border">{tp.totalStudents}</td>
                  <td className="p-3 border">{tp.totalExams}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
