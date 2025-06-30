'use client';

import { useState } from "react";
import axios from "@/lib/axios";

export default function RaiseIssuePage() {
  const [msg, setMsg] = useState("");

  const raise = async () => {
    if (!msg) return alert("Message required");
    await axios.post("/issues", { message: msg });
    alert("Issue submitted");
    setMsg("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Raise an Issue</h2>
      <textarea
        rows={5}
        className="w-full border p-3 rounded mb-4"
        placeholder="Describe your issue..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      <button
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        onClick={raise}
      >
        Submit Issue
      </button>
    </div>
  );
}
