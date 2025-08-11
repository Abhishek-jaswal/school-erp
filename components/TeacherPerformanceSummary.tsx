'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Teacher, Exam, Submission } from '@/types'; // keep your base types

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TeacherPerformance {
  teacherId: string;
  teacherName: string;
  subject: string;
  avgScore: number;
  passPercentage: number;
  totalStudents: number;
  totalExams: number;
}

// Narrowed row types for queries to avoid deep type recursion
type TeacherRow = Pick<Teacher, 'teacher_id' | 'first_name' | 'last_name' | 'subject'>;
type ExamRow = Pick<Exam, 'id' | 'subject' | 'exam_date' | 'total_marks' | 'questions'>;
type SubmissionRow = Pick<Submission, 'id' | 'exam_id' | 'student_id' | 'answers'>;

export default function TeacherPerformanceSummary() {
  const [performanceData, setPerformanceData] = useState<TeacherPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachersAndPerformance = async () => {
      setLoading(true);

      // Fetch all teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('teacher_id, first_name, last_name, subject')
        .returns<TeacherRow[]>();

      if (teachersError || !teachersData) {
        console.error('Error fetching teachers:', teachersError);
        setLoading(false);
        return;
      }

      // Parallelize performance calculation for each teacher
      const results = await Promise.all(
        teachersData.map(async (teacher) => {
          // Fetch exams for this teacher's subject
          const { data: examsData } = await supabase
            .from('exams')
            .select('id, subject, exam_date, total_marks, questions')
            .eq('subject', teacher.subject)
            .returns<ExamRow[]>();

          if (!examsData || examsData.length === 0) {
            return {
              teacherId: teacher.teacher_id,
              teacherName: `${teacher.first_name} ${teacher.last_name}`,
              subject: teacher.subject,
              avgScore: 0,
              passPercentage: 0,
              totalStudents: 0,
              totalExams: 0,
            };
          }

          const examIds = examsData.map((e) => e.id);

          // Fetch submissions
          const { data: submissionsData } = await supabase
            .from('exam_submissions')
            .select('id, exam_id, student_id, answers')
            .in('exam_id', examIds)
            .returns<SubmissionRow[]>();

          if (!submissionsData || submissionsData.length === 0) {
            return {
              teacherId: teacher.teacher_id,
              teacherName: `${teacher.first_name} ${teacher.last_name}`,
              subject: teacher.subject,
              avgScore: 0,
              passPercentage: 0,
              totalStudents: 0,
              totalExams: examsData.length,
            };
          }

          let totalScoreSum = 0;
          let passCount = 0;
          const passingMarksRatio = 0.4;
          const uniqueStudents = new Set<string>();

          for (const submission of submissionsData) {
            const exam = examsData.find((e) => e.id === submission.exam_id);
            if (!exam) continue;

            let correctCount = 0;
            exam.questions.forEach((q, i) => {
              if (
                q.answer.trim().toLowerCase() ===
                submission.answers[i]?.trim().toLowerCase()
              ) {
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

          return {
            teacherId: teacher.teacher_id,
            teacherName: `${teacher.first_name} ${teacher.last_name}`,
            subject: teacher.subject,
            avgScore: Math.round(avgScore * 100) / 100,
            passPercentage: Math.round(passPercentage * 100) / 100,
            totalStudents: uniqueStudents.size,
            totalExams: examsData.length,
          };
        })
      );

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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={performanceData}
            margin={{ top: 20, right: 40, left: 20, bottom: 80 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="teacherName"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis yAxisId="left" domain={[0, 100]} />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tickCount={6}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Bar yAxisId="left" dataKey="avgScore" fill="#4f46e5" name="Avg Score" />
            <Bar
              yAxisId="right"
              dataKey="passPercentage"
              fill="#10b981"
              name="Pass Percentage (%)"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
