"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";

interface Props {
  type: "teacher" | "student";
}

const SUBJECTS = ["Math", "English", "Physics", "Chemistry", "IT"];

export default function AddForm({ type }: Props) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    aadharNumber: "",
    alternateNumber: "",
    education: "",
    subject: "",
    number: "",
    id: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 // inside AddForm...
const addTeacher = useUserStore((state) => state.addTeacher);
const addStudent = useUserStore((state) => state.addStudent);
const teachers = useUserStore((state) => state.teachers);
const students = useUserStore((state) => state.students);

const handleSave = () => {
  if (type === "teacher") {
    addTeacher(form);
  } else {
    addStudent(form);
  }
  alert(`${type} added successfully!`);
  setForm({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    aadharNumber: "",
    alternateNumber: "",
    education: "",
    subject: "",
    number: "",
    id: "",
    password: "",
  });
};

  return (
    <div className="bg-white p-6 rounded shadow-lg max-w-auto mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New {type === "teacher" ? "Teacher" : "Student"}</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          "firstName",
          "lastName",
          "email",
          "contact",
          "address",
          "aadharNumber",
          "alternateNumber",
          "education",
          "number",
          "id",
          "password",
        ].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field as keyof typeof form]}
            onChange={handleChange}
            type={field === "password" ? "password" : "text"}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            className="p-2 border border-gray-300 rounded"
          />
        ))}
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="col-span-2 p-2 border border-gray-300 rounded"
        >
          <option value="">Select Subject</option>
          {SUBJECTS.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSave}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save {type}
      </button>
      <div className="mt-6">
  <h3 className="text-lg font-semibold mb-2">All {type === "teacher" ? "Teachers" : "Students"}</h3>
  <ul className="space-y-2">
    {(type === "teacher" ? teachers : students).map((person, index) => (
      <li key={index} className="p-2 border border-gray-300 rounded bg-gray-50">
        <span className="font-medium">{person.firstName} {person.lastName}</span> – {person.subject}
      </li>
    ))}
  </ul>
</div>

    </div>
  );
}
