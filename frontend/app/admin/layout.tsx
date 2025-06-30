import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-800 text-white p-4 space-y-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <nav className="space-y-2">
          <Link href="/admin/teachers" className="block hover:underline">Teachers</Link>
          <Link href="/admin/students" className="block hover:underline">Students</Link>
          <Link href="/admin/notifications" className="block hover:underline">Notifications</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
