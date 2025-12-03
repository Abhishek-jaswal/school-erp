"use client";

import { useEffect, useState } from "react";
import { pb } from "@/lib/pb";

interface Issue {
  id: string;
  role: string;
  user_id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
  name?: string;
}

export default function AdminIssuesList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  // ✅ Fetch issues + attach student/teacher names
  const fetchIssues = async () => {
    try {
      const rawIssues = await pb.collection("issues").getFullList({
        sort: "-created_at",
      });

      // --- Fetch teachers & students ---
      const teachers = await pb.collection("teachers").getFullList({
        fields: "id,firstname,lastname",
      });

      const students = await pb.collection("students").getFullList({
        fields: "id,firstname,lastname",
      });

      const teacherMap = new Map(
        teachers.map((t) => [t.id, `${t.firstname} ${t.lastname}`])
      );

      const studentMap = new Map(
        students.map((s) => [s.id, `${s.firstname} ${s.lastname}`])
      );

      // --- Attach correct name depending on role ---
      const enriched = rawIssues.map((i: any) => ({
        ...i,
        name:
          i.role === "teacher"
            ? teacherMap.get(i.user_id)
            : studentMap.get(i.user_id),
      }));

      setIssues(enriched);
    } catch (err) {
      console.error(err);
      alert("Failed to load issues");
    }
  };

  // ✅ Update issue status
  const handleResolve = async (id: string) => {
    setUpdatingId(id);
    try {
      await pb.collection("issues").update(id, {
        status: "resolved",
      });

      fetchIssues();
    } catch (err) {
      console.error(err);
      alert("Failed to update issue");
    }
    setUpdatingId(null);
  };

  return (
    <div className="mt-8 p-4 sm:p-6 max-w-6xl mx-auto bg-white shadow rounded-md">
      <h2 className="text-2xl font-bold mb-4">⚠️ Raised Issues</h2>

      <div className="overflow-x-auto">
        {issues.length === 0 ? (
          <p className="text-gray-500">No issues found.</p>
        ) : (
          <table className="min-w-[900px] w-full text-sm border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Role</th>
                <th className="border px-3 py-2">Type</th>
                <th className="border px-3 py-2">Message</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Time</th>
                <th className="border px-3 py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {issues.map((issue, idx) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{idx + 1}</td>
                  <td className="border px-3 py-2">{issue.name || "Unknown"}</td>
                  <td className="border px-3 py-2 capitalize">{issue.role}</td>
                  <td className="border px-3 py-2">{issue.type}</td>

                  <td
                    className="border px-3 py-2 max-w-[200px] truncate"
                    title={issue.message}
                  >
                    {issue.message}
                  </td>

                  <td className="border px-3 py-2 capitalize">
                    {issue.status}
                  </td>

                  <td className="border px-3 py-2 whitespace-nowrap">
                    {new Date(issue.created_at).toLocaleString()}
                  </td>

                  <td className="border px-3 py-2">
                    {issue.status !== "resolved" ? (
                      <button
                        onClick={() => handleResolve(issue.id)}
                        disabled={updatingId === issue.id}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                      >
                        {updatingId === issue.id ? "Updating..." : "Mark Resolved"}
                      </button>
                    ) : (
                      <span className="text-green-600 font-semibold text-xs">
                        Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
