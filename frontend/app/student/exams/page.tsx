'use client';

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

type Exam = {
  id: number;
  date: string;
  duration: number;
  total_marks: number;
  questions: string[];
};

export default function ExamsPage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    axios.get("/student/exams").then((res) => {
      setExam(res.data);
      setAnswers(new Array(res.data.questions.length).fill(""));
    });
  }, []);

  const handleChange = (index: number, value: string) => {
    const newAns = [...answers];
    newAns[index] = value;
    setAnswers(newAns);
  };

  const submitExam = async () => {
    await axios.post(`/student/exams/${exam?.id}/submit`, { answers });
    alert("Exam submitted");
    setSubmitted(true);
  };

  if (!exam) return <p>Loading exam...</p>;

  const isToday = new Date(exam.date).toDateString() === new Date().toDateString();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Exam</h2>

      {!isToday && <p className="text-red-600">You can only attempt on {exam.date}</p>}

      {isToday && !submitted && (
        <div className="space-y-4">
          <p><strong>Date:</strong> {exam.date}</p>
          <p><strong>Total Marks:</strong> {exam.total_marks}</p>
          <p><strong>Duration:</strong> {exam.duration} minutes</p>

          {exam.questions.map((q, idx) => (
            <div key={idx}>
              <p className="font-semibold">{q}</p>
              <textarea
                rows={3}
                className="w-full border p-2 rounded"
                value={answers[idx]}
                onChange={(e) => handleChange(idx, e.target.value)}
              />
            </div>
          ))}

          <button onClick={submitExam} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Submit Exam
          </button>
        </div>
      )}

      {submitted && <p className="text-green-600 mt-4">Exam submitted successfully.</p>}
    </div>
  );
}
