"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Activity, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authedFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";

type EngineState = {
  difficulty: number;
  chainId: number;
  mempool: any[];
  chain: any[];
  isMining: boolean;
};

export default function DashboardPage() {
  const { token, wallet } = useAuth();
  const [state, setState] = useState<EngineState | null>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [gasFeeWei, setGasFeeWei] = useState("1000000000");
  const [nonce, setNonce] = useState(0);
  const mempool = state?.mempool ?? [];

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const r = await authedFetch("/api/engine/state", token);
      const json = await r.json();
      setState(json);
    })();
  }, [token]);

  useEffect(() => {
    const s = getSocket();
    const onState = (st: any) => setState(st);
    const onMempool = (mp: any) => setState((prev) => (prev ? { ...prev, mempool: mp } : prev));
    const onChain = (ch: any) => setState((prev) => (prev ? { ...prev, chain: ch } : prev));
    const onDiff = (d: any) => setState((prev) => (prev ? { ...prev, difficulty: d } : prev));
    s.on("engine:state", onState);
    s.on("mempool:update", onMempool);
    s.on("chain:update", onChain);
    s.on("difficulty:update", onDiff);
    return () => {
      s.off("engine:state", onState);
      s.off("mempool:update", onMempool);
      s.off("chain:update", onChain);
      s.off("difficulty:update", onDiff);
    };
  }, []);

  const canSubmit = useMemo(() => Boolean(token && wallet && to && amount), [token, wallet, to, amount]);

  const submitTx = async () => {
    if (!token) throw new Error("Not authenticated");
    const provider = new ethers.BrowserProvider((globalThis as any).ethereum);
    const signer = await provider.getSigner();

    const payload = {
      kind: "NATIVE" as const,
      to,
      amount,
      gasFeeWei,
      nonce,
      chainId: state?.chainId ?? 31337,
      signature: ""
    };
    const msg = `DeFiSecure Tx\nfrom=${wallet?.address}\nto=${to}\namount=${amount}\ngasFeeWei=${gasFeeWei}\nnonce=${nonce}\nchainId=${payload.chainId}`;
    payload.signature = await signer.signMessage(msg);

    const r = await authedFetch("/api/tx", token, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error("Transaction submit failed");
    setNonce((n) => n + 1);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-300" />
              Create Transaction
            </CardTitle>
            <CardDescription>Signed via MetaMask, streamed into the mempool.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-white/60">Recipient</div>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/60"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-white/60">Amount (ETH demo)</div>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/60"
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-white/60">Nonce</div>
                <input
                  value={nonce}
                  onChange={(e) => setNonce(Number(e.target.value))}
                  type="number"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/60"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/60">Gas fee (wei)</div>
              <input
                value={gasFeeWei}
                onChange={(e) => setGasFeeWei(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/60"
              />
            </div>
            <Button disabled={!canSubmit} onClick={() => void submitTx()} className="w-full">
              Sign & Broadcast
            </Button>
            {!token && <div className="text-xs text-amber-200/80">Connect wallet to authenticate (top-right).</div>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-300" />
              Live Mempool
            </CardTitle>
            <CardDescription>
              Difficulty: <span className="text-white">{state?.difficulty ?? "-"}</span> · Pending:{" "}
              <span className="text-white">{mempool.length}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {mempool.slice(0, 12).map((tx: any) => (
                <div key={tx.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs text-white/70">{tx.id}</div>
                    <div className="rounded-full bg-cyan-400/15 px-2 py-1 text-[11px] text-cyan-200">
                      {tx.status}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    <div>
                      <span className="text-white/40">From</span>{" "}
                      <span className="font-mono">{String(tx.from).slice(0, 10)}…</span>
                    </div>
                    <div>
                      <span className="text-white/40">To</span>{" "}
                      <span className="font-mono">{String(tx.to).slice(0, 10)}…</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-white/40">Amount</span> {tx.amount} ·{" "}
                      <span className="text-white/40">Gas</span> {tx.gasFeeWei}
                    </div>
                    <div className="mt-1">
                      <span className="text-white/40">Risk</span> {typeof tx.riskScore === "number" ? tx.riskScore.toFixed(2) : "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {mempool.length === 0 && <div className="text-sm text-white/60">No pending transactions.</div>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

