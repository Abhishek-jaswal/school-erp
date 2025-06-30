'use client';

import { useState } from "react";
import axios from "@/lib/axios";

export default function AddExamPage() {
  const [form, setForm] = useState({
    date: "",
    duration: "",
    total_marks: "",
    questions: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      questions: form.questions.split('\n').map(q => q.trim()).filter(q => q),
    };

    await axios.post("/teacher/exams", payload);
    alert("Exam added");
    setForm({ date: "", duration: "", total_marks: "", questions: "" });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add New Exam</h2>

      <div className="grid grid-cols-2 gap-4">
        <input name="date" type="date" className="border p-2" onChange={handleChange} value={form.date} />
        <input name="duration" placeholder="Duration (mins)" className="border p-2" onChange={handleChange} value={form.duration} />
        <input name="total_marks" placeholder="Total Marks" className="border p-2" onChange={handleChange} value={form.total_marks} />
      </div>

      <textarea
        name="questions"
        rows={6}
        placeholder="Enter questions (one per line)"
        className="w-full border p-3 mt-4 rounded"
        value={form.questions}
        onChange={handleChange}
      />

      <button
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={handleSubmit}
      >
        Submit Exam
      </button>
    </div>
  );
}
