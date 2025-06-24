"use client";

import { useUserStore } from "@/store/useUserStore";

export default function IssueList() {
  const issues = useUserStore((state) => state.issues);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Reported Issues</h2>
      {issues.length === 0 ? (
        <p className="text-gray-500">No issues reported yet.</p>
      ) : (
        <ul className="space-y-3">
          {issues.map((issue, i) => (
            <li key={i} className="p-3 border border-gray-300 rounded bg-gray-50">
              <p className="font-medium text-sm">
                From: {issue.by} ({issue.role})
              </p>
              <p className="text-sm">{issue.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
