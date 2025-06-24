"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student">("admin");

  const handleLogin = () => {
    if (role === "admin" && userId === "admin" && password === "admin123") {
      login(userId, role);
      router.push("/admin");
    } else {
      // Later: validate teacher/student login via backend
      login(userId, role);
      router.push(`/${role}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">School ERP Login</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter ID"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter password"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}
