-- Add migration script here
-- Create Teachers Table
CREATE TABLE teachers (
  id VARCHAR PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  contact TEXT,
  address TEXT,
  aadharNumber TEXT,
  alternateNumber TEXT,
  education TEXT,
  subject TEXT,
  password TEXT
);

-- Create Students Table
CREATE TABLE students (
  id VARCHAR PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  contact TEXT,
  address TEXT,
  aadharNumber TEXT,
  alternateNumber TEXT,
  education TEXT,
  subject TEXT,
  password TEXT
);

-- Seed Admin Teacher
INSERT INTO teachers (
  id, firstName, lastName, email, contact, address,
  aadharNumber, alternateNumber, education, subject, password
)
VALUES (
  'admin', 'Admin', 'User', 'admin@example.com', '9999999999', 'HQ',
  '123456789012', '8888888888', 'MBA', 'IT',
  '$2b$04$Kzfz0Wc1OaKTUeOAYK7LOeuIEt/gbmfYOEy1KjLStMgfEtcCG4qJm' -- password: admin123
);

-- Create Subjects Table (for dropdowns)
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name TEXT
);

INSERT INTO subjects (name) VALUES 
  ('Math'), ('English'), ('Physics'), ('Chemistry'), ('IT');

-- Create Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Issues Table
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  by_user_id TEXT,
  role TEXT, -- 'teacher' or 'student'
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Exams Table
CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  teacher_id TEXT,
  subject TEXT,
  date DATE,
  duration INT,
  total_marks INT,
  questions JSON
);

-- Create Syllabus Table
CREATE TABLE syllabus (
  id SERIAL PRIMARY KEY,
  teacher_id TEXT,
  subject TEXT,
  syllabus TEXT
);

-- Create Today’s Topics Table
CREATE TABLE todays_topics (
  id SERIAL PRIMARY KEY,
  teacher_id TEXT,
  subject TEXT,
  topic TEXT,
  date DATE DEFAULT CURRENT_DATE
);
