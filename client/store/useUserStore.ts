import { create } from "zustand";

type Role = "admin" | "teacher" | "student" | null;

interface Person {
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

interface UserStore {
  userId: string | null;
  role: Role;
  teachers: Person[];
  students: Person[];
  login: (userId: string, role: Role) => void;
  logout: () => void;
  addTeacher: (data: Person) => void;
  addStudent: (data: Person) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userId: null,
  role: null,
  teachers: [],
  students: [],
  login: (userId, role) => set({ userId, role }),
  logout: () => set({ userId: null, role: null }),
  addTeacher: (data) => set((state) => ({ teachers: [...state.teachers, data] })),
  addStudent: (data) => set((state) => ({ students: [...state.students, data] })),
}));
