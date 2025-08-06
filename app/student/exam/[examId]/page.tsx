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

    setExam(parsed.exam);
    setStudent(parsed.student);
    setAnswers(new Array(parsed.exam.questions.length).fill(''));
  }, [examId]);

  const handleOptionSelect = (qIndex: number, option: string) => {
    const updated = [...answers];
    updated[qIndex] = option;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    let correct = 0;
    exam.questions.forEach((q: any, i: number) => {
      if (q.answer.trim().toLowerCase() === answers[i].trim().toLowerCase()) {
        correct++;
      }
    });

    const total = exam.total_marks;
    const perQ = total / exam.questions.length;
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

  if (!exam || !student) return <p>Loading...</p>;

  const q = exam.questions[currentQuestion];
  const isCorrect = submitted && answers[currentQuestion] === q.answer;
  const isWrong = submitted && answers[currentQuestion] !== q.answer;

  return (
    <div className="flex h-screen">
      {/* Left sidebar question navigation */}
      <div className="w-20 bg-gray-100 border-r p-2 space-y-2">
        {exam.questions.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`w-full p-2 rounded font-bold ${
              answers[i] ? 'bg-blue-500 text-white' : 'bg-gray-300'
            } ${currentQuestion === i ? 'ring-2 ring-blue-700' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-bold mb-4">{exam.subject} - Q{currentQuestion + 1}</h2>

        <div className="border p-4 rounded bg-gray-50 space-y-4">
          <p className="font-medium text-lg">{q.question}</p>

          <div className="grid grid-cols-2 gap-2">
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

        {/* Controls */}
        <div className="flex justify-between mt-6">
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

        {/* Score on submission */}
        {submitted && score !== null && (
          <div className="mt-6 p-4 bg-white border rounded shadow text-lg font-semibold">
            ✅ Final Score: {score} / {exam.total_marks}
            
          </div>
        )}
      </div>

      {/* Modal */}
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
    </div>
  );
}
