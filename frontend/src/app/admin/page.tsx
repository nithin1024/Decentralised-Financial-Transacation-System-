"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Sliders } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authedFetch } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function AdminPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [fraud, setFraud] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState<number>(4);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    void (async () => {
      const u = await authedFetch("/api/admin/users", token);
      const f = await authedFetch("/api/admin/fraud", token);
      setUsers((await u.json()).users ?? []);
      setFraud((await f.json()).logs ?? []);
    })();
  }, [token, user?.role]);

  const updateDifficulty = async () => {
    if (!token) return;
    await authedFetch("/api/admin/difficulty", token, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ difficulty })
    });
  };

  if (!token) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>Connect wallet to continue.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>This route requires ADMIN role.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Admin Command Center</h2>
        <p className="mt-1 text-sm text-white/60">Wallet governance, security controls, and AI fraud reports.</p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-300" />
              Difficulty Control
            </CardTitle>
            <CardDescription>Adjust PoW difficulty (simulation).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="number"
              min={1}
              max={8}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/60"
            />
            <Button className="w-full" onClick={() => void updateDifficulty()}>
              Apply
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-300" />
              Fraud Alerts
            </CardTitle>
            <CardDescription>High-risk transactions flagged by the AI engine.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {fraud.slice(0, 20).map((f) => (
                <div key={f._id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs">{String(f.walletAddress).slice(0, 12)}…</div>
                    <div className="rounded-full bg-rose-500/15 px-2 py-1 text-[11px] text-rose-200">
                      Risk {Number(f.riskScore).toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-white/70">{f.reason}</div>
                  {f.txEngineId && <div className="mt-1 font-mono text-xs text-white/50">{f.txEngineId}</div>}
                </div>
              ))}
              {fraud.length === 0 && <div className="text-sm text-white/60">No alerts.</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Wallets registered via MetaMask auth.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {users.slice(0, 20).map((u) => (
                <div key={u._id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs">{String(u.walletAddress).slice(0, 14)}…</div>
                    <div className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">{u.role}</div>
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    Trust: {Number(u.trustScore ?? 0).toFixed(2)} · Frozen: {String(Boolean(u.frozen))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

