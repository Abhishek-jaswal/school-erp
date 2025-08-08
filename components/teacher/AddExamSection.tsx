'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import type { Teacher, Student } from '@/types';

interface Props {
  teacher: Teacher;
}

export default function AddExamSection({ teacher }: Props) {
  const [form, setForm] = useState({
    subject: teacher.subject,
    exam_date: '',
    duration: '',
    total_marks: '',
    student_ids: [] as string[],
    questions: [
      { question: '', options: ['', '', '', ''], answer: '' },
    ],
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // 📥 Fetch students for the same subject as the teacher
  useEffect(() => {
     const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, subject')
        .eq('subject', teacher.subject);

      if (error) {
        console.error('Error fetching students:', error.message);
      } else {
        setStudents(data as Student[]);
      }
    };
    fetchStudents();
  }, [teacher.subject]);

  // 🔄 Update top-level form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔄 Update question fields
  const handleQuestionChange = (idx: number, field: string, value: string) => {
    const updated = [...form.questions];
    if (field === 'question' || field === 'answer') {
      updated[idx][field] = value;
    } else {
      updated[idx].options[parseInt(field)] = value;
    }
    setForm({ ...form, questions: updated });
  };

  // ➕ Add new question block
  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        { question: '', options: ['', '', '', ''], answer: '' },
      ],
    });
  };

  // ❌ Remove a question block
  const removeQuestion = (idx: number) => {
    const updated = [...form.questions];
    updated.splice(idx, 1);
    setForm({ ...form, questions: updated });
  };

  // ✅ Toggle student selection
  const handleStudentToggle = (id: string) => {
    const updated = form.student_ids.includes(id)
      ? form.student_ids.filter((sid) => sid !== id)
      : [...form.student_ids, id];

    setForm({ ...form, student_ids: updated });
  };

  // 📤 Submit exam to Supabase
  const handleSubmit = async () => {
    if (form.student_ids.length === 0) {
      alert('Please select at least one student.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('exams').insert([
      {
        teacher_id: teacher.id,
        subject: form.subject,
        exam_date: form.exam_date,
        duration: form.duration,
        total_marks: form.total_marks,
        student_ids: form.student_ids,
        questions: form.questions,
      },
    ]);

    if (error) {
      alert('Failed to create exam: ' + error.message);
    } else {
      alert('✅ Exam scheduled successfully!');
      // 🔄 Reset form
      setForm({
        subject: teacher.subject,
        exam_date: '',
        duration: '',
        total_marks: '',
        student_ids: [],
        questions: [{ question: '', options: ['', '', '', ''], answer: '' }],
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800"> Schedule New Exam</h2>

      {/* Exam Details */}
      <div className="grid md:grid-cols-3 gap-4">
        <input
          name="exam_date"
          type="date"
          value={form.exam_date}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        <input
          name="duration"
          placeholder="Duration (e.g., 60 mins)"
          value={form.duration}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        <input
          name="total_marks"
          placeholder="Total Marks"
          value={form.total_marks}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Student Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700"> Select Students</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {students.map((stu) => (
            <label
              key={stu.id}
              className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={form.student_ids.includes(stu.id)}
                onChange={() => handleStudentToggle(stu.id)}
              />
              <span>{stu.first_name} {stu.last_name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-700"> Questions</h3>

        {form.questions.map((q, idx) => (
          <div key={idx} className="border p-4 rounded bg-gray-50 space-y-3">
            <input
              placeholder={`Question ${idx + 1}`}
              value={q.question}
              onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
              className="w-full border p-2 rounded"
            />

            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, optIdx) => (
                <input
                  key={optIdx}
                  placeholder={`Option ${optIdx + 1}`}
                  value={opt}
                  onChange={(e) => handleQuestionChange(idx, String(optIdx), e.target.value)}
                  className="border p-2 rounded"
                />
              ))}
            </div>

            <input
              placeholder="Correct Answer"
              value={q.answer}
              onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
              className="w-full border p-2 rounded"
            />

            <div className="text-right">
              <button
                onClick={() => removeQuestion(idx)}
                className="text-red-500 text-sm hover:underline"
              >
                ❌ Remove Question
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          + Add Question
        </button>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
        >
          {loading ? 'Saving...' : 'Save Exam'}
        </button>
      </div>
    </div>
  );
}
