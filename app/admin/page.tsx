// app/teacher/page.tsx
import { redirect } from "next/navigation";

export default function AdminHome() {
  redirect("/admin/dashboard"); // or '/admin/dashboard' if you create a dashboard
}
