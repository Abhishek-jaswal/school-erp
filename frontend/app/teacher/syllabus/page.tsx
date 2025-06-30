'use client';

import { useState } from "react";
import axios from "@/lib/axios";

export default function SyllabusPage() {
  const [syllabus, setSyllabus] = useState("");

  const upload = async () => {
    if (!syllabus) return alert("Syllabus required");
    await axios.post("/teacher/syllabus", { syllabus });
    alert("Syllabus uploaded");
    setSyllabus("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Syllabus</h2>
      <textarea
        rows={8}
        className="w-full border p-3 rounded mb-4"
        placeholder="Enter full syllabus here..."
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
      />
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        onClick={upload}
      >
        Upload
      </button>
    </div>
  );
}
