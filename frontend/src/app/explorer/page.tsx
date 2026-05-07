"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSocket } from "@/lib/socket";

export default function ExplorerPage() {
  const [chain, setChain] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const s = getSocket();
    const onState = (st: any) => setChain(st.chain ?? []);
    const onChain = (ch: any) => setChain(ch ?? []);
    s.on("engine:state", onState);
    s.on("chain:update", onChain);
    return () => {
      s.off("engine:state", onState);
      s.off("chain:update", onChain);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chain.slice().reverse();
    return chain
      .filter((b) => String(b.hash).toLowerCase().includes(q) || String(b.miner).toLowerCase().includes(q))
      .slice()
      .reverse();
  }, [chain, query]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Blockchain Explorer</h2>
          <p className="mt-1 text-sm text-white/60">Blocks, mining stats, and transaction lists (simulation).</p>
        </div>
        <div className="relative w-full md:w-[420px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by hash or miner…"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan-400/60"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.map((b) => (
          <Card key={b.hash}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Block #{b.index}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  Difficulty {b.difficulty} · {b.transactions?.length ?? 0} tx
                </span>
              </CardTitle>
              <CardDescription className="font-mono break-all">{b.hash}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/50">Miner</div>
                <div className="mt-1 font-mono text-xs">{String(b.miner).slice(0, 12)}…</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/50">Nonce</div>
                <div className="mt-1 font-mono text-xs">{b.nonce}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/50">Previous</div>
                <div className="mt-1 font-mono text-xs">{String(b.previousHash).slice(0, 16)}…</div>
              </div>
              <div className="md:col-span-3">
                <div className="text-xs text-white/50">Transactions</div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {(b.transactions ?? []).slice(0, 6).map((tx: any) => (
                    <div key={tx.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs text-white/70">{tx.id}</div>
                        <div className="text-[11px] text-cyan-200">{tx.status}</div>
                      </div>
                      <div className="mt-1 text-xs text-white/70">
                        {String(tx.from).slice(0, 10)}… → {String(tx.to).slice(0, 10)}… · {tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-sm text-white/60">No blocks found.</div>}
      </div>
    </main>
  );
}

