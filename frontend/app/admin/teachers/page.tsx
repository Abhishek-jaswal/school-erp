'use client';

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  subject: string;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    axios.get("/admin/teachers").then((res) => setTeachers(res.data));
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    await axios.post("/admin/teachers", form);
    alert("Teacher added");
    location.reload();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Teachers</h2>
      <table className="w-full table-auto border mb-6">
        <thead className="bg-gray-200">
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Subject</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id} className="border-b">
              <td>{t.id}</td>
              <td>{t.firstName} {t.lastName}</td>
              <td>{t.email}</td>
              <td>{t.subject}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="font-semibold mb-2">Add New Teacher</h3>
      <div className="grid grid-cols-2 gap-4">
        <input name="id" placeholder="ID" onChange={handleChange} className="border p-2" />
        <input name="password" placeholder="Password" onChange={handleChange} className="border p-2" />
        <input name="firstName" placeholder="First Name" onChange={handleChange} className="border p-2" />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} className="border p-2" />
        <input name="email" placeholder="Email" onChange={handleChange} className="border p-2" />
        <input name="contact" placeholder="Contact" onChange={handleChange} className="border p-2" />
        <input name="subject" placeholder="Subject" onChange={handleChange} className="border p-2" />
        <button onClick={handleAdd} className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Teacher</button>
      </div>
    </div>
  );
}
