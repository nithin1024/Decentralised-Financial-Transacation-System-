"use client";

import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function TransactionsPage() {
  const { token } = useAuth();
  const [txs, setTxs] = useState<any[]>([]);
  useEffect(() => {
    if (!token) return;
    void authedFetch("/api/tx/history", token).then((r) => r.json()).then((j) => setTxs(j.txs ?? []));
  }, [token]);
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Transaction History</h1>
      <div className="mt-4 grid gap-2">
        {txs.map((tx) => (
          <div key={tx._id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
            <div className="font-mono text-xs">{tx.engineTxId}</div>
            <div className="mt-1 text-white/70">{tx.from} → {tx.to}</div>
            <div className="mt-1">{tx.amount} · {tx.status}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

