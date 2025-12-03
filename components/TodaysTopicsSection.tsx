'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pb';

interface TopicWithTeacher {
  id: string;
  title: string;
  subject: string;
  date: string;
  teacher?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function TodaysTopicsSection() {
  const [topics, setTopics] = useState<TopicWithTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      const today = new Date().toISOString().split("T")[0];

      try {
        /** 🔥 PocketBase Query with expand */
        const data = await pb.collection('topics').getFullList({
          filter: `date = "${today}"`,
          sort: '-created',
          expand: 'teacher_id',
          fields: 'id, title, subject, date, teacher_id',
        });

        /** Normalize output */
        const formatted = data.map((topic: any) => ({
          id: topic.id,
          title: topic.title,
          subject: topic.subject,
          date: topic.date,
          teacher: topic.expand?.teacher_id
            ? {
                id: topic.expand.teacher_id.id,
                full_name: topic.expand.teacher_id.full_name,
                email: topic.expand.teacher_id.email,
              }
            : null,
        }));

        setTopics(formatted);
      } catch (err) {
        console.error("PocketBase Error:", err);
      }

      setLoading(false);
    };

    fetchTopics();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6 w-full">
      <h2 className="text-xl font-semibold mb-4">📘 Today Topics by Teachers</h2>

      {loading ? (
        <p>Loading...</p>
      ) : topics.length === 0 ? (
        <p className="text-gray-500">No topics submitted today.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">#</th>
                <th className="p-2">Title</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Teacher</th>
                <th className="p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, index) => (
                <tr key={topic.id} className="border-t">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-medium">{topic.title}</td>
                  <td className="p-2">{topic.subject}</td>
                  <td className="p-2">{topic.teacher?.full_name || "—"}</td>
                  <td className="p-2">{topic.teacher?.email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
