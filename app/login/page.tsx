"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pb";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // ---- FIXED ADMIN LOGIN ----
      if (role === "admin") {
        if (email === "admin" && password === "admin123") {
          localStorage.setItem("role", "admin");
          router.push("/admin");
          return;
        } else {
          alert("Invalid admin credentials");
          return;
        }
      }

      // ---- TEACHER LOGIN ----
      if (role === "teacher") {
        const auth = await pb.collection("teachers").authWithPassword(email, password);

        localStorage.setItem("role", "teacher");
        localStorage.setItem("userId", auth.record.id);
        router.push("/teacher");
        return;
      }

      // ---- STUDENT LOGIN ----
      if (role === "student") {
        const auth = await pb.collection("students").authWithPassword(email, password);

        localStorage.setItem("role", "student");
        localStorage.setItem("userId", auth.record.id);
        router.push("/student");
        return;
      }
    } catch (err) {
      alert("Invalid credentials");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">Login</h1>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        >
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>

        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 w-full text-white py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
