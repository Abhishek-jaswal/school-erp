// types/index.ts

export interface Teacher {
  id: string;
  subject: string;
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  address: string;
  aadhaar?: string;
  alternate_contact?: string;
  education?: string;
  profile_image?: string;
  teacher_id: string;
  created_at: string; 
}


// types/index.ts

export interface Student {
  id: string;
  subject: string;
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  address: string;
  aadhaar?: string;
  alternate_contact?: string;
  education?: string;
  profile_image?: string;
  created_at: string; 
  student_id:string;
}


export interface Topic {
  id: string;
  teacher_id: string;
  date: string;
  topic: string;
  subject: string;
}

// types/index.ts

export interface TopicWithTeacher {
  id: string;
  title: string;
  subject: string;
  date: string;
  teacher: {
    id: string;
    full_name: string;
    email: string;
  };
}


export interface ExamQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface Exam {
  id: string;
  subject: string;
  exam_date: string;
  total_marks: number;
  duration: string;
  questions: ExamQuestion[];
  student_ids: string[];
}

export interface Submission {
  id: string;
  exam_id: string;
  student_id: string;
  answers: string[];
  submitted_at: string;
  students: {
    first_name: string;
    last_name: string;
  }; // ✅ NOT an array
}


export interface Issue {
  id: number;
  user_id: string;
  role: 'teacher' | 'student';
  type: string;
  message: string;
  status: 'unresolved' | 'processing' | 'resolved';
  created_at: string;
  name?: string; // populated after mapping from teacher/student
}

export interface Notification {
  id: number;
  message: string;
  created_at: string;
}
