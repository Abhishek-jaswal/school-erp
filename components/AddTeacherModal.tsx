'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  onClose: () => void
  onTeacherAdded: () => void // ✅ New prop
}

export default function AddTeacherModal({ onClose, onTeacherAdded }: Props) {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: '',
    address: '',
    adharnumber: '',
    alternatenumber: '',
    education: '',
    subject: '',
    number: '',
   custom_id: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    const { data, error } = await supabase.from('teachers').insert([{ ...form }])
    if (error) {
      console.error(error)
    } else {
      onTeacherAdded() // ✅ Trigger refresh
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
      <div className="p-6  bg-gray-800  rounded-xl shadow-xl w-full max-w-xl text-gray-200">
        <h2 className="text-xl font-bold mb-4">Add New Teacher</h2>

        <div className="grid grid-cols-2 gap-4">
          <input name="firstname" onChange={handleChange} placeholder="First Name" className="border p-2 rounded" />
          <input name="lastname" onChange={handleChange} placeholder="Last Name" className="border p-2 rounded" />
          <input name="email" onChange={handleChange} placeholder="Email" className="border p-2 rounded" />
          <input name="contact" onChange={handleChange} placeholder="Contact" className="border p-2 rounded" />
          <input name="address" onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
          <input name="adharnumber" onChange={handleChange} placeholder="Aadhar Number" className="border p-2 rounded" />
          <input name="alternatenumber" onChange={handleChange} placeholder="Alternate Number" className="border p-2 rounded" />
          <input name="education" onChange={handleChange} placeholder="Education" className="border p-2 rounded" />
          <select name="subject" onChange={handleChange} className="border p-2 rounded">
            <option value="">Select Subject</option>
            <option value="Math">Math</option>
            <option value="English">English</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="IT">IT</option>
          </select>
          <input name="number" onChange={handleChange} placeholder="Number" className="border p-2 rounded" />
          <input name="custom_id" onChange={handleChange} placeholder=" ID" className="border p-2 rounded" />
          <input name="password" type="password" onChange={handleChange} placeholder="Password" className="border p-2 rounded" />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  )
}
