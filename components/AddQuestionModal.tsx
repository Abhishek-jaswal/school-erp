'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddQuestionModal({ exam, onClose }: any) {
  const [text, setText] = useState('')
  const [ops, setOps] = useState(['', '', '', ''])
  const [correct, setCorrect] = useState('')

  const handle = async () => {
    await supabase.from('questions').insert({
      exam_id: exam.id,
      question_text: text,
      option_a: ops[0],
      option_b: ops[1],
      option_c: ops[2],
      option_d: ops[3],
      correct_option: correct,
    })
    setText(''); setOps(['','','','']); setCorrect('')
    alert('Added')
  }

  return (
    <div className="modal">
      <textarea placeholder="Question" value={text} onChange={e=>setText(e.target.value)} />
      {ops.map((o,i)=>(<input key={i} placeholder={`Option ${i+1}`} value={o} onChange={e=>{const n=[...ops];n[i]=e.target.value;setOps(n)}} />))}
      <input placeholder="Correct (A‑D)" value={correct} onChange={e=>setCorrect(e.target.value)} />
      <button onClick={handle}>Add</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
