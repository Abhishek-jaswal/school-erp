// app/teacher/page.tsx
import { redirect } from "next/navigation";

export default function TeacherHome() {
  redirect("/teacher/dashboard"); // or '/teacher/dashboard' if you create a dashboard
}
