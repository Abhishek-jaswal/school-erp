'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

interface Props {
  onClose: () => void
  onStudentAdded: () => void
}

export default function AddStudentModal({ onClose, onStudentAdded }: Props) {
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
    username: '',
    password: ''
  })

  const [loadingId, setLoadingId] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'subject') {
      await generateUsername(value)
    }
  }

  const generateUsername = async (subject: string) => {
    if (!subject) return

    setLoadingId(true)
    const subjectCode = subject.toUpperCase().substring(0, 3)
    const prefix = `UI${subjectCode}`

    const { data, error } = await supabase
      .from('students')
      .select('id', { count: 'exact' })
      .eq('subject', subject)

    const count = data?.length || 0
    const nextNumber = (count + 11).toString().padStart(3, '0')
    const generatedId = `${prefix}${nextNumber}`

    setForm(prev => ({ ...prev, username: generatedId }))
    setLoadingId(false)
  }

  const handleSave = async () => {
    if (!form.subject || !form.username) {
      alert('Please select a subject to generate ID first.')
      return
    }

    setSaving(true)
    try {
      const hashedPassword = await bcrypt.hash(form.password, 10)

      const { error } = await supabase.from('students').insert([
        {
          ...form,
          password: hashedPassword
        }
      ])

      if (error) {
        console.error(error)
        alert('Error adding student.')
      } else {
        onStudentAdded()
        onClose()
      }
    } catch (err) {
      console.error(err)
      alert('Unexpected error occurred.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded shadow-xl w-full max-w-xl text-gray-200">
        <h2 className="text-xl font-bold mb-4">Add New Student</h2>

        <div className="grid grid-cols-2 gap-4">
          <input name="firstname" onChange={handleChange} placeholder="First Name" className="border p-2 rounded" />
          <input name="lastname" onChange={handleChange} placeholder="Last Name" className="border p-2 rounded" />
          <input name="email" onChange={handleChange} placeholder="Email" className="border p-2 rounded" />
          <input name="contact" onChange={handleChange} placeholder="Contact" className="border p-2 rounded" />
          <input name="address" onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
          <input name="adharnumber" onChange={handleChange} placeholder="Aadhar Number" className="border p-2 rounded" />
          <input name="alternatenumber" onChange={handleChange} placeholder="Alternate Number" className="border p-2 rounded" />
          <input name="number" onChange={handleChange} placeholder="Parents Number" className="border p-2 rounded" />
          <input name="education" onChange={handleChange} placeholder="Education" className="border p-2 rounded" />
          <select name="subject" onChange={handleChange} className="border p-2 rounded">
            <option value="">Select Subject</option>
            <option value="Math">Math</option>
            <option value="English">English</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="IT">IT</option>
          </select>
          <input
            name="username"
            value={loadingId ? 'Generating...' : form.username}
            readOnly
            placeholder="Auto-generated ID"
            className="border p-2 rounded bg-gray-600 text-white"
          />
          <input name="password" type="password" onChange={handleChange} placeholder="Password" className="border p-2 rounded" />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
