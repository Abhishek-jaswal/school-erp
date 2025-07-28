// app/admin/issues/page.tsx
"use client";

import Sidebar from "@/components/Sidebar";

export default function AdminIssuesPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 md:p-6  w-full">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-200">
            Reported Issues
          </h1>
          <div className="bg-gray-800 shadow-md rounded-lg p-4">
            <p className="text-gray-200">
              Show and manage reported issues by users here.
            </p>

            {/* Placeholder for issue list or table */}
            <div className="mt-6 text-center text-sm text-gray-400">
              No issues reported yet.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
