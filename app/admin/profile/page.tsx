"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Admin Profile</h1>
        <div className="space-y-2 bg-white shadow p-4 rounded-md">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> Admin</p>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}</p>
        </div>
      </main>
    </div>
  );
}
