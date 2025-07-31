'use client'
import { useState } from 'react'
import AddExamForm from '@/components/AddExamForm'
import ExamTable from '@/components/ExamTable'

export default function ExamsPage() {
  const [refresh, setRefresh] = useState(false)

  return (
    <div className="p-6 space-y-8">
      <AddExamForm onExamAdded={() => setRefresh(r => !r)} />
      <ExamTable refresh={refresh} />
    </div>
  )
}
