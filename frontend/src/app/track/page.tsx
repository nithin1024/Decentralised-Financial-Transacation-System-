"use client";

import { useMemo, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState<any[]>([]);
  useMemo(() => {
    const s = getSocket();
    const onState = (st: any) => setChain(st.chain ?? []);
    s.on("engine:state", onState);
    s.on("chain:update", onState);
    return () => {
      s.off("engine:state", onState);
      s.off("chain:update", onState);
    };
  }, []);
  const results = chain.flatMap((b) => (b.transactions ?? []).map((t: any) => ({ ...t, block: b.index }))).filter((t) => !query || String(t.id).includes(query) || String(t.from).includes(query) || String(t.to).includes(query));
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Track Transaction</h1>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hash or wallet..." className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2" />
      <div className="mt-4 grid gap-2">
        {results.slice(0, 30).map((tx: any) => (
          <div key={tx.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
            <div className="font-mono text-xs">{tx.id}</div>
            <div className="mt-1">Block #{tx.block} · {tx.status}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

