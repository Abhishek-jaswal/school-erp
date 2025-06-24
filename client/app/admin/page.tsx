"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import AddForm from "@/components/AddForm";
import NotificationForm from "@/components/NotificationForm";
import IssueList from "@/components/IssueList";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"teachers" | "students" | null>(null);

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("teachers")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Teachers
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Students
          </button>
        </div>

        {activeTab === "teachers" && (
          <div>
            <AddForm type="teacher" />
          </div>
        )}

        {activeTab === "students" && (
          <div>
            <AddForm type="student" />
          </div>
        )}

        {/* ✅ Add Notification */}
        <NotificationForm />

        {/* ✅ View Issues */}
        <IssueList />
      </main>
    </div>
  );
}
