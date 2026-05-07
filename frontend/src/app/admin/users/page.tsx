"use client";
import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const load = async () => {
    if (!token) return;
    const r = await authedFetch("/api/admin/users", token);
    setUsers((await r.json()).users ?? []);
  };
  useEffect(() => { void load(); }, [token]);
  const freeze = async (walletAddress: string, frozen: boolean) => {
    if (!token) return;
    await authedFetch("/api/admin/users/freeze", token, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ walletAddress, frozen }) });
    await load();
  };
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">User Management</h1>
      <div className="mt-4 grid gap-2">
        {users.map((u) => (
          <div key={u._id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
            <div className="font-mono text-xs">{u.walletAddress}</div>
            <div className="mt-1">{u.role} · Frozen: {String(u.frozen)}</div>
            <div className="mt-2 flex gap-2">
              <button className="rounded bg-white/10 px-3 py-1" onClick={() => void freeze(u.walletAddress, !u.frozen)}>
                {u.frozen ? "Unfreeze" : "Freeze"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

