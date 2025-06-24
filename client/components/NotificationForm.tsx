"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function NotificationForm() {
  const [note, setNote] = useState("");
  const addNotification = useUserStore((state) => state.addNotification);
  const notifications = useUserStore((state) => state.notifications);

  const handleAdd = () => {
    if (!note.trim()) return;
    addNotification(note.trim());
    setNote("");
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-2">Add Notification</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a notification..."
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />
      <button
        onClick={handleAdd}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
      >
        Add
      </button>

      {notifications.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Previous Notifications:</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            {notifications.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
