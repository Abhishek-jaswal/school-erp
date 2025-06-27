import { create } from "zustand";

export type Role = "admin" | "teacher" | "student" | null;

export interface Person {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  address: string;
  aadharNumber: string;
  alternateNumber: string;
  education: string;
  subject: string;
  number: string;
  id: string;
  password: string;
}

export interface Issue {
  by: string;
  role: "teacher" | "student";
  message: string;
}

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface Exam {
  id: string;
  teacherId: string;
  subject: string;
  date: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
}

interface UserStore {
  userId: string | null;
  role: Role;
  teachers: Person[];
  students: Person[];
  notifications: string[];
  issues: Issue[];
  exams: Exam[];

  // Actions
  login: (userId: string, role: Role) => void;
  logout: () => void;
  addTeacher: (data: Person) => void;
  addStudent: (data: Person) => void;
  addNotification: (note: string) => void;
  addIssue: (issue: Issue) => void;
  addExam: (exam: Exam) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userId: null,
  role: null,
  teachers: [],
  students: [],
  notifications: [],
  issues: [],
  exams: [],

  login: (userId, role) => set({ userId, role }),
  logout: () => set({ userId: null, role: null }),

  addTeacher: (data) =>
    set((state) => ({ teachers: [...state.teachers, data] })),

  addStudent: (data) =>
    set((state) => ({ students: [...state.students, data] })),

  addNotification: (note) =>
    set((state) => ({ notifications: [note, ...state.notifications] })),

  addIssue: (issue) =>
    set((state) => ({ issues: [issue, ...state.issues] })),

  addExam: (exam) =>
    set((state) => ({ exams: [...state.exams, exam] })),
}));
