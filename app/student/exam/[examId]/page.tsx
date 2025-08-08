'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Exam, Student } from '@/types';

export default function ExamAttemptPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('activeExam');
    if (!stored) {
      router.push('/student');
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.exam.id !== examId) {
      router.push('/student');
      return;
    }
    const durationMins = parseInt(parsed.exam.duration) || 60;
    setTimeLeft(durationMins * 60);
    setExam(parsed.exam);
    setStudent(parsed.student);
    setAnswers(new Array(parsed.exam.questions.length).fill(''));
  }, [examId, router]);

  const handleSubmit = useCallback(async () => {
    if (!exam || !student) return;

    const correct = exam.questions.reduce((count, q, i) => {
      return q.answer.trim().toLowerCase() === answers[i]?.trim().toLowerCase()
        ? count + 1
        : count;
    }, 0);

    const perQ = exam.total_marks / exam.questions.length;
    const calculatedScore = Math.round(correct * perQ);

    const { error } = await supabase.from('exam_submissions').insert([
      {
        exam_id: exam.id,
        student_id: student.id,
        answers,
      },
    ]);

    if (error) {
      alert('Submission failed: ' + error.message);
    } else {
      setSubmitted(true);
      setScore(calculatedScore);
      localStorage.removeItem('activeExam');
      setShowModal(false);
    }
  }, [answers, exam, student]);

  const handleAutoSubmit = useCallback(() => {
    if (!submitted) {
      alert('⏱ Time is up! Auto-submitting your exam.');
      handleSubmit();
    }
  }, [submitted, handleSubmit]);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 300) setShowWarning(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, handleAutoSubmit]);

  const formatTime = (secs: number): string => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleOptionSelect = (qIndex: number, option: string) => {
    const updated = [...answers];
    updated[qIndex] = option;
    setAnswers(updated);
  };

  if (!exam || !student) return <p className="p-6 text-center">Loading exam...</p>;
  const q = exam.questions[currentQuestion];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-800">📝 {exam.subject} Exam</h1>
        {!submitted && (
          <div className="text-red-600 font-semibold text-lg">⏱ {formatTime(timeLeft)}</div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="col-span-1 bg-gray-50 border rounded p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Questions</h2>
          <div className="grid grid-cols-5 md:grid-cols-1 gap-2">
            {exam.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-10 h-10 rounded-full font-bold text-sm mx-auto md:mx-0
                  ${answers[i] ? 'bg-blue-600 text-white' : 'bg-gray-300'}
                  ${currentQuestion === i ? 'ring-2 ring-blue-800' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-3 bg-white border rounded p-6 shadow space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Q{currentQuestion + 1}: {q.question}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {q.options.map((opt, i) => {
                const isCorrect = submitted && opt === q.answer;
                const isWrong = submitted && answers[currentQuestion] === opt && opt !== q.answer;
                return (
                  <label
                    key={i}
                    className={`border rounded p-3 cursor-pointer flex items-center transition
                      ${answers[currentQuestion] === opt ? 'border-blue-600' : 'border-gray-300'}
                      ${isCorrect ? 'bg-green-100 border-green-500' : ''} ${isWrong ? 'bg-red-100 border-red-500' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion}`}
                      value={opt}
                      checked={answers[currentQuestion] === opt}
                      disabled={submitted}
                      onChange={() => handleOptionSelect(currentQuestion, opt)}
                      className="mr-3"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ⬅ Prev
            </button>

            {!submitted && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ✅ Submit Exam
              </button>
            )}

            <button
              onClick={() =>
                setCurrentQuestion((prev) => Math.min(prev + 1, exam.questions.length - 1))
              }
              disabled={currentQuestion === exam.questions.length - 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Next ➡
            </button>
          </div>

          {submitted && score !== null && (
            <div className="mt-6 p-4 bg-green-100 border border-green-500 rounded text-lg font-semibold text-green-800">
              ✅ Final Score: {score} / {exam.total_marks}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Confirm Submission</h2>
            <p>
              You have answered {answers.filter((a) => a).length} out of {exam.questions.length} questions.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarning && !submitted && (
        <div className="fixed bottom-6 right-6 bg-yellow-100 border-l-4 border-yellow-600 text-yellow-800 px-4 py-3 rounded shadow animate-bounce z-50">
          ⏳ Only 5 minutes left!
        </div>
      )}
    </div>
  );
}
