"use client";

import { useState } from "react";
import { pb } from "@/lib/pb";

interface Props {
  role: "teachers" | "students";
  onClose: () => void;
}

export default function AddUserModal({ role, onClose }: Props) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact: "",
    address: "",
    aadhaar: "",
    alternate_contact: "",
    education: "",
    subject: "Math",
    password: ""
  });

  const subjects = ["Math", "English", "Physics", "Chemistry", "IT"];

  const prefixMap: Record<string, string> = {
    IT: "IT",
    English: "ENG",
    Math: "MATH",
    Physics: "PHY",
    Chemistry: "CHEM",
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.password) return alert("Password is required");

    try {
      const prefix = prefixMap[form.subject];
      const idField = role === "teachers" ? "teacher_id" : "student_id";

      // ---- Get last generated ID ----
      const records = await pb.collection(role).getFullList({
        filter: `${idField} ~ "${prefix}"`,
        sort: `-${idField}`, // Descending
        perPage: 1
      });

      let newId = "";
      if (records.length === 0) {
        newId = role === "teachers" ? `${prefix}001` : `${prefix}0011`;
      } else {
        const lastId = records[0][idField];
        const num = parseInt(lastId.replace(/\D/g, ""), 10);
        const next = (num + 1).toString().padStart(3, "0");
        newId = role === "teachers" ? `${prefix}${next}` : `${prefix}${next}1`;
      }

      // ---- Create Record ----
      await pb.collection(role).create({
        ...form,
        [idField]: newId,
        password: form.password // PB will auto-hash
      });

      alert(`${role.slice(0, -1)} added with ID: ${newId}`);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to add user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Add {role === "teachers" ? "Teacher" : "Student"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(form).map(([field, value]) =>
            field !== "subject" && field !== "password" ? (
              <input
                key={field}
                name={field}
                value={value}
                onChange={handleChange}
                placeholder={field.replace("_", " ").toUpperCase()}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
            ) : null
          )}

          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="col-span-2 px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="col-span-2 px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
