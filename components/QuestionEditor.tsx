"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function QuestionEditor({ examId, onClose }: { examId: string, onClose: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQ, setNewQ] = useState({ text: "", options: ["", "", "", ""], answer: "" });

  const fetchQuestions = async () => {
    const { data } = await supabase.from("questions").select("*").eq("exam_id", examId);
    setQuestions(data || []);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleAdd = async () => {
    await supabase.from("questions").insert({
      exam_id: examId,
      text: newQ.text,
      options: newQ.options,
      answer: newQ.answer,
    });
    setNewQ({ text: "", options: ["", "", "", ""], answer: "" });
    fetchQuestions();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[600px] max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">✍️ Edit Questions</h2>
        {questions.map((q, i) => (
          <div key={q.id} className="mb-4 p-2 border rounded">
            <b>Q{i + 1}:</b> {q.text}
            <ul className="list-disc pl-5">
              {q.options.map((opt: string, idx: number) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
            <p className="text-green-700">Correct: {q.answer}</p>
          </div>
        ))}

        <div className="mt-6">
          <input type="text" placeholder="Question Text" className="input" value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} />
          {newQ.options.map((opt, idx) => (
            <input key={idx} type="text" placeholder={`Option ${idx + 1}`} className="input mt-1" value={opt} onChange={(e) => {
              const newOpts = [...newQ.options];
              newOpts[idx] = e.target.value;
              setNewQ({ ...newQ, options: newOpts });
            }} />
          ))}
          <input type="text" placeholder="Correct Answer" className="input mt-1" value={newQ.answer} onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })} />
          <button className="bg-blue-600 text-white px-4 py-2 mt-2 rounded" onClick={handleAdd}>Add Question</button>
        </div>

        <button onClick={onClose} className="mt-4 text-red-600 underline">Close</button>
      </div>
    </div>
  );
}