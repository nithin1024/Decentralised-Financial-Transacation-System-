"use client";
import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function AdminTransactionsPage() {
  const { token } = useAuth();
  const [txs, setTxs] = useState<any[]>([]);
  const load = async () => {
    if (!token) return;
    const r = await authedFetch("/api/admin/transactions", token);
    setTxs((await r.json()).txs ?? []);
  };
  useEffect(() => { void load(); }, [token]);
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Transaction Management</h1>
      <div className="mt-4 grid gap-2">
        {txs.map((tx) => (
          <div key={tx._id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
            <div className="font-mono text-xs">{tx.engineTxId}</div>
            <div className="mt-1">{tx.from} → {tx.to}</div>
            <div className="mt-1">{tx.amount} · {tx.status}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

