'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

interface Teacher { id: string; subject: string; }
interface Student { id: string; first_name: string; last_name: string; }
interface Props { teacher: Teacher; }

export default function AddExamSection({ teacher }: Props) {
  const [form, setForm] = useState({
    subject: teacher.subject,
    exam_date: '',
    duration: '',
    total_marks: '',
    student_ids: [] as string[],
    questions: [{ question: '', options: ['', '', '', ''], answer: '' }],
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    pb.collection('students')
      .getFullList({ filter: `subject="${teacher.subject}"` })
      .then(data => setStudents(data as unknown as Student[]))
      .catch(err => console.error(err));
  }, [teacher.subject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleQuestionChange = (idx: number, field: string, value: string) => {
    const updated = [...form.questions];
    if (field === 'question' || field === 'answer') {
      updated[idx][field as 'question' | 'answer'] = value;
    } else {
      updated[idx].options[parseInt(field)] = value;
    }
    setForm({ ...form, questions: updated });
  };

  const addQuestion = () => setForm({
    ...form,
    questions: [...form.questions, { question: '', options: ['', '', '', ''], answer: '' }],
  });

  const removeQuestion = (idx: number) => setForm({
    ...form,
    questions: form.questions.filter((_, i) => i !== idx),
  });

  const handleStudentToggle = (id: string) => setForm({
    ...form,
    student_ids: form.student_ids.includes(id)
      ? form.student_ids.filter(s => s !== id)
      : [...form.student_ids, id],
  });

  const handleSubmit = async () => {
    if (!form.exam_date) return alert('Please set an exam date.');
    if (!form.total_marks) return alert('Please set total marks.');
    if (form.student_ids.length === 0) return alert('Select at least one student.');
    if (form.questions.some(q => !q.question.trim() || !q.answer.trim()))
      return alert('All questions must have text and a correct answer.');

    setLoading(true);
    try {
      await pb.collection('exams').create({
        teacher_id: teacher.id,
        subject: form.subject,
        exam_date: form.exam_date,
        duration: form.duration,
        total_marks: parseInt(form.total_marks),
        student_ids: form.student_ids,
        questions: form.questions,
      });
      alert('✅ Exam scheduled successfully!');
      setForm({
        subject: teacher.subject, exam_date: '', duration: '', total_marks: '',
        student_ids: [],
        questions: [{ question: '', options: ['', '', '', ''], answer: '' }],
      });
    } catch (err: unknown) {
      alert('Failed: ' + (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="font-bold text-[#1e1b4b] text-xl mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          📝 Schedule New Exam
        </h2>

        {/* Exam details */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            { name: 'exam_date', type: 'date', placeholder: 'Exam Date' },
            { name: 'duration', type: 'text', placeholder: 'Duration (e.g. 60 mins)' },
            { name: 'total_marks', type: 'number', placeholder: 'Total Marks' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{f.placeholder}</label>
              <input name={f.name} type={f.type}
                value={(form as unknown as Record<string, string>)[f.name]}
                onChange={handleChange}
                className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition w-full"
              />
            </div>
          ))}
        </div>

        {/* Student selection */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Select Students <span className="text-gray-400 normal-case font-normal">({form.student_ids.length} selected)</span>
          </h3>
          {students.length === 0 ? (
            <p className="text-sm text-gray-400">No students enrolled in {teacher.subject}.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {students.map(stu => (
                <label key={stu.id}
                  className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer text-sm transition
                    ${form.student_ids.includes(stu.id)
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                      : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" checked={form.student_ids.includes(stu.id)}
                    onChange={() => handleStudentToggle(stu.id)} className="accent-indigo-600" />
                  {stu.first_name} {stu.last_name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Questions <span className="text-gray-400 normal-case font-normal">({form.questions.length})</span>
          </h3>
          {form.questions.map((q, idx) => (
            <div key={idx} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Q{idx + 1}</span>
                {form.questions.length > 1 && (
                  <button onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-600 text-xs transition">
                    ✕ Remove
                  </button>
                )}
              </div>
              <input placeholder="Question text" value={q.question}
                onChange={e => handleQuestionChange(idx, 'question', e.target.value)}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <input key={oi} placeholder={`Option ${oi + 1}`} value={opt}
                    onChange={e => handleQuestionChange(idx, String(oi), e.target.value)}
                    className="border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  />
                ))}
              </div>
              <input placeholder="✓ Correct Answer (must match one option exactly)" value={q.answer}
                onChange={e => handleQuestionChange(idx, 'answer', e.target.value)}
                className="w-full border border-green-200 p-2.5 rounded-xl text-sm bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          ))}

          <button onClick={addQuestion}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-400 hover:text-indigo-600 w-full py-3 rounded-2xl text-sm font-medium transition">
            + Add Question
          </button>
        </div>

        <div className="mt-6">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#1e1b4b] hover:bg-indigo-900 text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-md transition disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Exam →'}
          </button>
        </div>
      </div>
    </div>
  );
}
