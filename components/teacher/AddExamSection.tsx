'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  teacher: any;
}

export default function AddExamSection({ teacher }: Props) {
  const [form, setForm] = useState({
    subject: teacher.subject,
    exam_date: '',
    duration: '',
    total_marks: '',
    questions: [
      { question: '', options: ['', '', '', ''], answer: '' },
    ],
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const updated = [...form.questions];
    if (field === 'question' || field === 'answer') {
      updated[idx][field] = value;
    } else {
      updated[idx].options[parseInt(field)] = value;
    }
    setForm({ ...form, questions: updated });
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        { question: '', options: ['', '', '', ''], answer: '' },
      ],
    });
  };

  const removeQuestion = (idx: number) => {
    const updated = [...form.questions];
    updated.splice(idx, 1);
    setForm({ ...form, questions: updated });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const { error } = await supabase.from('exams').insert([
      {
        teacher_id: teacher.id,
        subject: form.subject,
        exam_date: form.exam_date,
        duration: form.duration,
        total_marks: form.total_marks,
        questions: form.questions,
      },
    ]);

    if (error) {
      alert('Failed to create exam: ' + error.message);
    } else {
      alert('Exam scheduled successfully!');
      setForm({
        subject: teacher.subject,
        exam_date: '',
        duration: '',
        total_marks: '',
        questions: [{ question: '', options: ['', '', '', ''], answer: '' }],
      });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">Schedule New Exam</h2>

      <input
        name="exam_date"
        type="date"
        value={form.exam_date}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        name="duration"
        placeholder="Duration (e.g., 60 mins)"
        value={form.duration}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        name="total_marks"
        placeholder="Total Marks"
        value={form.total_marks}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Questions</h3>

        {form.questions.map((q, idx) => (
          <div key={idx} className="border p-3 rounded space-y-2 bg-gray-50">
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

            <button
              onClick={() => removeQuestion(idx)}
              className="text-red-500 underline text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
        >
          + Add Question
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Saving...' : 'Save Exam'}
      </button>
    </div>
  );
}
