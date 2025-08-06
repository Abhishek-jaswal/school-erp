# 🏫 School ERP - Exam Management System

A fully-featured, responsive, and real-time **Exam Management System** built with **Next.js (App Router)** and **Supabase**. This system supports three user roles:

- 👨‍🏫 **Teachers**: Create and schedule exams, manage syllabus, monitor students, and raise issues.
- 🎓 **Students**: Attempt exams, track scores, view syllabus, and raise issues.
- 🛡️ **Admin**: Manage teachers and students, view issues, send notifications, and monitor the system.

---

## 🚀 Tech Stack

- **Next.js 14 (App Router)**
- **Supabase** (Auth + Database + Realtime)
- **TypeScript**
- **Tailwind CSS** (Responsive UI)

---

## 📁 Features

### 👨‍🏫 Teacher Dashboard

| Feature             | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| 👤 Profile           | View and edit profile details                                               |
| 👨‍🎓 View Students     | Filter students by subject, view student details                          |
| 📝 Add Exam          | Schedule exams with selected students, questions, and settings              |
| 📚 Add Syllabus      | Upload syllabus content per subject                                         |
| 🗒️ Today's Topic     | Add topic of the day to be shown in admin panel                            |
| ⚠️ Raise Issue       | Raise academic/technical issues visible to admin                           |

---

### 🎓 Student Dashboard

| Feature         | Description                                                               |
|------------------|---------------------------------------------------------------------------|
| 👤 Profile         | Update name, contact, and profile photo                                  |
| 📘 View Syllabus   | View syllabus uploaded by the teacher                                    |
| 📝 Exam Panel      | View scheduled exams, countdown timer, responsive step-by-step layout    |
| ✅ Exam Logic      | One question at a time, button navigation, final result with score        |
| 📊 Scorecard       | View correct answers and total marks after submission                    |
| ⚠️ Raise Issue     | Raise issues directly from the dashboard                                 |

---

### 🛡️ Admin Panel

| Feature             | Description                                                        |
|---------------------|--------------------------------------------------------------------|
| 👨‍🏫 Manage Teachers   | Add/edit/delete teachers, assign subjects                          |
| 🎓 Manage Students    | Add/edit/delete students, assign subjects                          |
| 🔔 Notifications      | Send system-wide notifications                                     |
| 📈 Exam Analytics     | (Planned) Track exam scores and performance                        |
| ⚠️ View Issues        | All issues raised by students and teachers in real-time            |

---

## 🗃️ Supabase Database Schema

### 📘 `teachers` Table

```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  contact TEXT,
  address TEXT,
  subject TEXT,
  profile_pic TEXT,
  password TEXT
);
```

## 📷 UI Screens

- Page Description
- /admin Admin login and control panel
- /teacher Teacher dashboard
- /student Student dashboard
- /exam/attempt Exam-taking interface with timer and steps

## 📦 Setup Instructions

1. Clone the Repository
bash
Copy
Edit
git clone <https://github.com/your-username/school-erp.git>
cd school-erp
2. Install Dependencies
bash
Copy
Edit
npm install
3. Setup Supabase
Create a project at <https://supabase.com>

Create all tables using SQL above

Get your SUPABASE_URL and SUPABASE_ANON_KEY

Create .env.local:

- NEXT_PUBLIC_SUPABASE_URL=your-url
- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
  
1. Run the App
bash
Copy
Edit
npm run dev
App will run on <http://localhost:3000>

## 🔐 Security Notes

All login routes validate credentials using Supabase Auth or custom logic

Student exams are only accessible if:

They're selected for the exam

It's the scheduled date

Exam submissions are stored with timestamp and can't be re-submitted

UUIDs are used for strong data security

## ✅ Upcoming Features

## 🧠 AI-powered question generation

## 📉 Analytics dashboard for admin

## 📊 Live exam charts

## 📄 License

MIT © 2025 - Developed by Abhishek Jaswal
Feel free to fork, extend, and contribute!
