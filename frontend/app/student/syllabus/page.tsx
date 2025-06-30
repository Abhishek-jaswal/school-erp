'use client';

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

type Syllabus = {
  id: number;
  subject: string;
  syllabus: string;
};

export default function SyllabusPage() {
  const [data, setData] = useState<Syllabus | null>(null);

  useEffect(() => {
    axios.get("/student/syllabus").then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Syllabus</h2>
      {data ? (
        <div className="bg-white p-4 rounded shadow border">
          <p className="text-lg font-semibold mb-2">Subject: {data.subject}</p>
          <p className="whitespace-pre-line">{data.syllabus}</p>
        </div>
      ) : (
        <p>Loading syllabus...</p>
      )}
    </div>
  );
}
