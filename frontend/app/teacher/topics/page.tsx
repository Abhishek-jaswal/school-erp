'use client';

import { useState } from "react";
import axios from "@/lib/axios";

export default function TopicsPage() {
  const [topic, setTopic] = useState("");

  const handleSubmit = async () => {
    if (!topic) return alert("Topic required");
    await axios.post("/teacher/topics", { topic });
    alert("Topic submitted");
    setTopic("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Submit Today’s Topic</h2>
      <textarea
        rows={4}
        className="w-full border p-3 rounded mb-4"
        placeholder="Enter topic for today..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit Topic
      </button>
    </div>
  );
}
