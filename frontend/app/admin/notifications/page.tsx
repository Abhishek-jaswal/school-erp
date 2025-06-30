'use client';

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

type Notification = {
  id: number;
  content: string;
  created_at: string;
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/notifications").then((res) => setNotifications(res.data));
  }, []);

  const sendNotification = async () => {
    if (!message) return alert("Enter notification");
    await axios.post("/notifications", { content: message });
    alert("Notification sent!");
    setMessage("");
    location.reload();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Send Notification</h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter notification..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={sendNotification}
          className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700"
        >
          Send
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2">All Notifications</h3>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="p-3 bg-white shadow rounded border">
            <p>{n.content}</p>
            <p className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
