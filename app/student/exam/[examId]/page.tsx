'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ExamAttemptPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
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

    const durationMins = parsed.exam.duration || 60;
    setTimeLeft(durationMins * 60); // in seconds

    setExam(parsed.exam);
    setStudent(parsed.student);
    setAnswers(new Array(parsed.exam.questions.length).fill(''));
  }, [examId]);

  // ⏱ Countdown Timer
  useEffect(() => {
    if (submitted || !timeLeft) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit(); // auto submit
          return 0;
        }

        if (prev === 300) setShowWarning(true); // 5 min
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted, timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleOptionSelect = (qIndex: number, option: string) => {
    const updated = [...answers];
    updated[qIndex] = option;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    const correct = exam.questions.reduce((count: number, q: any, i: number) => {
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
  };

  const handleAutoSubmit = () => {
    if (!submitted) {
      alert('⏱ Time is up! Auto-submitting your exam.');
      handleSubmit();
    }
  };

  if (!exam || !student) return <p>Loading...</p>;

  const q = exam.questions[currentQuestion];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="md:w-20 w-full flex md:flex-col overflow-x-auto bg-gray-100 border-r p-2 space-x-2 md:space-y-2 md:space-x-0">
        {exam.questions.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`w-10 h-10 rounded font-bold ${
              answers[i] ? 'bg-blue-500 text-white' : 'bg-gray-300'
            } ${currentQuestion === i ? 'ring-2 ring-blue-700' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex justify-between items-center flex-wrap mb-4">
          <h2 className="text-xl font-bold">
            {exam.subject} - Q{currentQuestion + 1}
          </h2>
          {!submitted && (
            <p className="text-red-600 font-semibold text-sm md:text-base">
              ⏱ Time Left: {formatTime(timeLeft)}
            </p>
          )}
        </div>

        <div className="border p-4 rounded bg-gray-50 space-y-4">
          <p className="font-medium text-lg">{q.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt: string, i: number) => {
              const highlight =
                submitted && opt === q.answer
                  ? 'bg-green-200'
                  : submitted && answers[currentQuestion] === opt && opt !== q.answer
                  ? 'bg-red-200'
                  : '';

              return (
                <label
                  key={i}
                  className={`block border p-2 rounded cursor-pointer ${
                    answers[currentQuestion] === opt ? 'border-blue-600' : ''
                  } ${highlight}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={opt}
                    checked={answers[currentQuestion] === opt}
                    disabled={submitted}
                    onChange={() => handleOptionSelect(currentQuestion, opt)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation + Submit */}
        <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            ⬅ Prev
          </button>

          {!submitted && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              ✅ Submit Exam
            </button>
          )}

          <button
            onClick={() =>
              setCurrentQuestion((prev) => Math.min(prev + 1, exam.questions.length - 1))
            }
            disabled={currentQuestion === exam.questions.length - 1}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Next ➡
          </button>
        </div>

        {/* Score */}
        {submitted && score !== null && (
          <div className="mt-6 p-4 bg-white border rounded shadow text-lg font-semibold">
            ✅ Final Score: {score} / {exam.total_marks}
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 space-y-4 w-full max-w-md">
            <h2 className="text-xl font-bold">Confirm Submission</h2>
            <p>
              Are you sure you want to submit? You answered{' '}
              {answers.filter((a) => a).length} / {exam.questions.length} questions.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5 min warning */}
      {showWarning && !submitted && (
        <div className="fixed bottom-6 right-6 bg-yellow-200 border border-yellow-600 text-yellow-900 px-4 py-2 rounded shadow z-50 animate-bounce">
          ⏳ Only 5 minutes left!
        </div>
      )}
    </div>
  );
}
