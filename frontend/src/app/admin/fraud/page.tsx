"use client";
import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function AdminFraudPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    if (!token) return;
    void authedFetch("/api/admin/fraud", token).then((r) => r.json()).then((j) => setLogs(j.logs ?? []));
  }, [token]);
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Fraud Analytics</h1>
      <div className="mt-4 grid gap-2">
        {logs.map((l) => (
          <div key={l._id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
            <div className="font-mono text-xs">{l.walletAddress}</div>
            <div className="mt-1">Risk: {Number(l.riskScore).toFixed(2)} · {l.reason}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

