'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pb';

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

export default function TeacherPerformanceSummary() {
  const [performanceData, setPerformanceData] = useState<TeacherPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);

      try {
        /** ============================
         *  1. Fetch Teachers (PocketBase)
         * ============================ */
        const teachers = await pb.collection('teachers').getFullList({
          fields: 'teacher_id, first_name, last_name, subject',
        });

        if (!teachers.length) {
          setPerformanceData([]);
          setLoading(false);
          return;
        }

        /** ==========================================
         *  2. Process each teacher (parallel mapping)
         * ========================================== */
        const results = await Promise.all(
          teachers.map(async (teacher: any) => {
            /** Fetch exams for this teacher's subject */
            const exams = await pb.collection('exams').getFullList({
              filter: `subject = "${teacher.subject}"`,
              fields: 'id, subject, exam_date, total_marks, questions',
            });

            if (!exams.length) {
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

            const examIds = exams.map((e: any) => e.id);

            /** Fetch submissions for these exams */
            const submissions = await pb.collection('exam_submissions').getFullList({
              filter: `exam_id IN (${examIds.map((id) => `"${id}"`).join(',')})`,
              fields: 'id, exam_id, student_id, answers',
            });

            if (!submissions.length) {
              return {
                teacherId: teacher.teacher_id,
                teacherName: `${teacher.first_name} ${teacher.last_name}`,
                subject: teacher.subject,
                avgScore: 0,
                passPercentage: 0,
                totalStudents: 0,
                totalExams: exams.length,
              };
            }

            // Scoring Logic
            let totalScoreSum = 0;
            let passCount = 0;
            const uniqueStudents = new Set<string>();
            const passingMarksRatio = 0.4;

            for (const submission of submissions) {
              const exam = exams.find((e) => e.id === submission.exam_id);
              if (!exam) continue;

              let correctCount = 0;

              exam.questions.forEach((q: any, i: number) => {
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

            const avgScore = totalScoreSum / submissions.length;
            const passPercentage = (passCount / submissions.length) * 100;

            return {
              teacherId: teacher.teacher_id,
              teacherName: `${teacher.first_name} ${teacher.last_name}`,
              subject: teacher.subject,
              avgScore: Math.round(avgScore * 100) / 100,
              passPercentage: Math.round(passPercentage * 100) / 100,
              totalStudents: uniqueStudents.size,
              totalExams: exams.length,
            };
          })
        );

        setPerformanceData(results);
      } catch (err) {
        console.error('PocketBase Error:', err);
      }

      setLoading(false);
    };

    fetchPerformance();
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
            <Bar yAxisId="left" dataKey="avgScore" name="Avg Score" />
            <Bar yAxisId="right" dataKey="passPercentage" name="Pass Percentage (%)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
