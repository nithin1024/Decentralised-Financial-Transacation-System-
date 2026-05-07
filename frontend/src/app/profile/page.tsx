"use client";
import { useAuth } from "@/providers/auth-provider";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Profile Settings</h1>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/60">Role: {user?.role}</div>
        <button onClick={logout} className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm">Logout</button>
      </div>
    </main>
  );
}

