'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddQuestionsModal({ exam, onClose }: any) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correct, setCorrect] = useState('')

  const handleAdd = async () => {
    await supabase.from('questions').insert({
      exam_id: exam.id,
      question,
      options,
      correct_option: correct,
    })

    setQuestion('')
    setOptions(['', '', '', ''])
    setCorrect('')
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="text-lg font-bold mb-2">➕ Add Question for {exam.topic}</h2>
        <textarea className="input" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        {options.map((opt, i) => (
          <input key={i} className="input" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => {
            const newOpts = [...options]
            newOpts[i] = e.target.value
            setOptions(newOpts)
          }} />
        ))}
        <input className="input" placeholder="Correct Option (1/2/3/4)" value={correct} onChange={(e) => setCorrect(e.target.value)} />
        <button className="btn" onClick={handleAdd}>Add</button>
        <button className="btn-outline mt-2" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
