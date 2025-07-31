'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddExam() {
  const [form, setForm] = useState({ date: '', duration: '', total_marks: '' })
  const [questions, setQuestions] = useState([
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: '' }
  ])

  const handleAdd = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const { data: teacher } = await supabase
      .from('teachers')
      .select('subject')
      .eq('user_id', userData.user?.id)
      .single()

    // Insert exam
    const { data: exam, error: examError } = await supabase.from('exams').insert({
      ...form,
      subject: teacher?.subject,
      teacher_id: userData.user?.id,
    }).select().single()

    if (examError) return alert('❌ Error adding exam')

    // Insert questions linked to exam
    for (const q of questions) {
      await supabase.from('questions').insert({ ...q, exam_id: exam.id })
    }

    alert('✅ Exam and Questions Added')
    setForm({ date: '', duration: '', total_marks: '' })
    setQuestions([
      { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: '' }
    ])
  }

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  const addQuestionField = () => {
    setQuestions([...questions, {
      question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: ''
    }])
  }

  return (
    <div className="pl-64 p-8">
      <h1 className="text-2xl font-bold mb-4">📝 Add Exam</h1>
      <div className="space-y-4 max-w-xl">
        <input type="date" className="input" placeholder="Date" onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input type="text" className="input" placeholder="Duration" onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <input type="number" className="input" placeholder="Total Marks" onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
        
        <h2 className="text-lg font-semibold mt-6">🧾 Questions</h2>
        {questions.map((q, index) => (
          <div key={index} className="border p-4 rounded space-y-2 bg-gray-50">
            <input type="text" className="input" placeholder="Question" value={q.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} />
            <input type="text" className="input" placeholder="Option A" value={q.option_a} onChange={(e) => handleQuestionChange(index, 'option_a', e.target.value)} />
            <input type="text" className="input" placeholder="Option B" value={q.option_b} onChange={(e) => handleQuestionChange(index, 'option_b', e.target.value)} />
            <input type="text" className="input" placeholder="Option C" value={q.option_c} onChange={(e) => handleQuestionChange(index, 'option_c', e.target.value)} />
            <input type="text" className="input" placeholder="Option D" value={q.option_d} onChange={(e) => handleQuestionChange(index, 'option_d', e.target.value)} />
            <input type="text" className="input" placeholder="Correct Option (A/B/C/D)" value={q.correct_option} onChange={(e) => handleQuestionChange(index, 'correct_option', e.target.value)} />
          </div>
        ))}
        <button onClick={addQuestionField} className="bg-gray-500 text-white px-3 py-1 rounded">+ Add Question</button>

        <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded mt-4">Add Exam</button>
      </div>
    </div>
  )
}
