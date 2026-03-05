'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

interface Question { question: string; options: string[]; answer: string; }
interface Exam { id: string; subject: string; duration: string; total_marks: number; questions: Question[]; }
interface Student { id: string; first_name: string; last_name: string; }

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
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('activeExam');
    if (!stored) { router.push('/student'); return; }
    const parsed = JSON.parse(stored);
    if (parsed.exam.id !== examId) { router.push('/student'); return; }
    const durationMins = parseInt(parsed.exam.duration) || 60;
    setTimeLeft(durationMins * 60);
    setExam(parsed.exam);
    setStudent(parsed.student);
    setAnswers(new Array(parsed.exam.questions.length).fill(''));
  }, [examId, router]);

  const handleSubmit = useCallback(async () => {
    if (!exam || !student) return;
    const correct = exam.questions.reduce((count, q, i) =>
      q.answer.trim().toLowerCase() === answers[i]?.trim().toLowerCase() ? count + 1 : count, 0);
    const perQ = exam.total_marks / exam.questions.length;
    const calculatedScore = Math.round(correct * perQ);

    try {
      // PocketBase create submission
      await pb.collection('exam_submissions').create({ exam_id: exam.id, student_id: student.id, answers });
      setSubmitted(true); setScore(calculatedScore);
      localStorage.removeItem('activeExam'); setShowModal(false);
    } catch (err: unknown) { alert('Submission failed: ' + (err as Error).message); }
  }, [answers, exam, student]);

  const handleAutoSubmit = useCallback(() => {
    if (!submitted) { alert('⏱ Time is up! Auto-submitting.'); handleSubmit(); }
  }, [submitted, handleSubmit]);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); handleAutoSubmit(); return 0; }
        if (prev === 300) setShowWarning(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, handleAutoSubmit]);

  const formatTime = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  if (!exam || !student) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f4f0]">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const q = exam.questions[currentQuestion];
  const answeredCount = answers.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f5f4f0] p-4 md:p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#1e1b4b] text-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-xl shadow-indigo-900/20">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{exam.subject} Exam</h1>
            <p className="text-white/50 text-sm">{student.first_name} {student.last_name}</p>
          </div>
          {!submitted && (
            <div className={`text-lg font-bold tabular-nums px-4 py-2 rounded-xl ${timeLeft < 300 ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-white/10 text-white'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Question navigator */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Questions</h3>
            <div className="grid grid-cols-5 md:grid-cols-3 gap-2">
              {exam.questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQuestion(i)}
                  className={`aspect-square rounded-xl font-bold text-sm transition-all
                    ${answers[i] ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                    ${currentQuestion === i ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
              <div className="flex justify-between"><span>Answered</span><span className="font-semibold text-indigo-600">{answeredCount}/{exam.questions.length}</span></div>
            </div>
          </div>

          {/* Question card */}
          <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-black/5 space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question {currentQuestion + 1} of {exam.questions.length}</span>
              <h2 className="text-lg font-semibold text-gray-800 mt-2">{q.question}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const isSelected = answers[currentQuestion] === opt;
                const isCorrect = submitted && opt === q.answer;
                const isWrong = submitted && isSelected && !isCorrect;
                return (
                  <label key={i} className={`flex items-center gap-3 border-2 rounded-xl p-3.5 cursor-pointer transition-all
                    ${isCorrect ? 'border-green-400 bg-green-50' : isWrong ? 'border-red-400 bg-red-50' : isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                    <input type="radio" name={`q-${currentQuestion}`} value={opt}
                      checked={isSelected} disabled={submitted}
                      onChange={() => { const u = [...answers]; u[currentQuestion] = opt; setAnswers(u); }}
                      className="accent-indigo-600 w-4 h-4" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setCurrentQuestion(p => Math.max(p - 1, 0))} disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition disabled:opacity-40">← Prev</button>

              {!submitted && (
                <button onClick={() => setShowModal(true)}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-green-200 transition">
                  ✓ Submit Exam
                </button>
              )}

              <button onClick={() => setCurrentQuestion(p => Math.min(p + 1, exam.questions.length - 1))} disabled={currentQuestion === exam.questions.length - 1}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition disabled:opacity-40">Next →</button>
            </div>

            {submitted && score !== null && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-green-700">{score} <span className="text-lg font-normal text-green-500">/ {exam.total_marks}</span></p>
                <p className="text-green-600 text-sm mt-1">Final Score</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-[#1e1b4b] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Confirm Submission</h2>
            <p className="text-gray-500 text-sm mb-6">You've answered <strong>{answeredCount}</strong> of <strong>{exam.questions.length}</strong> questions. Submit now?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">Submit</button>
            </div>
          </div>
        </div>
      )}

      {showWarning && !submitted && (
        <div className="fixed bottom-6 right-6 bg-amber-50 border-l-4 border-amber-500 text-amber-800 px-5 py-4 rounded-2xl shadow-xl animate-bounce z-50 text-sm font-medium">
          ⏳ Only 5 minutes remaining!
        </div>
      )}
    </div>
  );
}
