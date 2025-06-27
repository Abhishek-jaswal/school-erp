"use client";

import { useUserStore } from "@/store/useUserStore";
import { useState } from "react";

export default function AddExamForm() {
  const userId = useUserStore((s) => s.userId);
  const teacher = useUserStore((s) =>
    s.teachers.find((t) => t.id === userId)
  );
  const addExam = useUserStore((s) => s.addExam);

  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updated = [...questions];
    if (field === "question" || field === "answer") {
      updated[index][field] = value;
    } else {
      const [_, optionIndex] = field.split(".");
      updated[index].options[+optionIndex] = value;
    }
    setQuestions(updated);
  };

  const addNewQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: "" }]);
  };

  const handleSubmit = () => {
    if (!teacher || !date || !duration || !totalMarks) return;

    addExam({
      id: crypto.randomUUID(),
      teacherId: teacher.id,
      subject: teacher.subject,
      date,
      duration: +duration,
      totalMarks: +totalMarks,
      questions,
    });

    alert("Exam added!");
    setDate("");
    setDuration("");
    setTotalMarks("");
    setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add Exam</h2>

      <div className="space-y-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration in minutes"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
          placeholder="Total Marks"
          className="w-full border p-2 rounded"
        />

        {questions.map((q, i) => (
          <div key={i} className="p-3 border rounded bg-gray-50">
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(i, "question", e.target.value)}
              placeholder={`Question ${i + 1}`}
              className="w-full p-2 border rounded mb-2"
            />
            {q.options.map((opt, j) => (
              <input
                key={j}
                type="text"
                value={opt}
                onChange={(e) => handleQuestionChange(i, `option.${j}`, e.target.value)}
                placeholder={`Option ${j + 1}`}
                className="w-full p-1 border mb-1 rounded"
              />
            ))}
            <input
              type="text"
              value={q.answer}
              onChange={(e) => handleQuestionChange(i, "answer", e.target.value)}
              placeholder="Correct Answer"
              className="w-full p-1 border rounded"
            />
          </div>
        ))}

        <button
          onClick={addNewQuestion}
          className="bg-gray-300 text-sm px-3 py-1 rounded"
        >
          ➕ Add Question
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 block mt-4"
        >
          Save Exam
        </button>
      </div>
    </div>
  );
}
