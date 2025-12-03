// lib/pocketbaseApi.ts

import pb from "./pb";

/* -------------------------------------------------
   STEP 6 — LOGIN (Users)
-------------------------------------------------- */
export async function login(email: string, password: string) {
  try {
    const auth = await pb.collection("users").authWithPassword(email, password);
    return auth;
  } catch (err) {
    console.error("Login failed:", err);
    throw err;
  }
}

/* -------------------------------------------------
   STEP 7 — FETCH STUDENTS
-------------------------------------------------- */
export async function getStudents() {
  return await pb.collection("students").getFullList({
    sort: "-created",
  });
}

/* -------------------------------------------------
   STEP 8 — ADD STUDENT
-------------------------------------------------- */
export async function addStudent(data: any) {
  return await pb.collection("students").create(data);
}

/* -------------------------------------------------
   STEP 9 — UPDATE STUDENT
-------------------------------------------------- */
export async function updateStudent(id: string, data: any) {
  return await pb.collection("students").update(id, data);
}

/* -------------------------------------------------
   STEP 10 — DELETE STUDENT
-------------------------------------------------- */
export async function deleteStudent(id: string) {
  return await pb.collection("students").delete(id);
}

/* -------------------------------------------------
   STEP 11 — REALTIME SUBSCRIBE (Live Updates)
-------------------------------------------------- */
export function subscribeStudents(callback: (event: any) => void) {
  return pb.collection("students").subscribe("*", (e) => {
    callback(e);
  });
}

/* -------------------------------------------------
   STEP 12 — OTHER COLLECTIONS (FETCH)
-------------------------------------------------- */

// TEACHERS
export async function getTeachers() {
  return await pb.collection("teachers").getFullList();
}

// SUBJECTS
export async function getSubjects() {
  return await pb.collection("subjects").getFullList();
}

// SYLLABUS
export async function getSyllabus() {
  return await pb.collection("syllabus").getFullList();
}

// TOPICS
export async function getTopics() {
  return await pb.collection("topics").getFullList();
}

// EXAMS
export async function getExams() {
  return await pb.collection("exams").getFullList();
}

// QUESTIONS
export async function getQuestions() {
  return await pb.collection("questions").getFullList();
}

// ISSUES
export async function getIssues() {
  return await pb.collection("issues").getFullList();
}

// NOTIFICATIONS
export async function getNotifications() {
  return await pb.collection("notifications").getFullList();
}
