"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pb";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (role === "admin") {
      if (email === "admin" && password === "admin123") {
        localStorage.setItem("role", "admin");
        router.push("/admin");
      } else {
        alert("Invalid admin credentials");
      }
      return;
    }

    try {
      // teacher OR student login
      const auth = await pb.collection(role).authWithPassword(email, password);

      localStorage.setItem("role", role);
      localStorage.setItem("userId", auth.record.id);

      router.push(`/${role}`);
    } catch (e) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">Login</h1>

        <div className="flex flex-col gap-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="admin">Admin</option>
            <option value="teachers">Teacher</option>
            <option value="students">Student</option>
          </select>

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-4 py-2"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-4 py-2"
          />

          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
