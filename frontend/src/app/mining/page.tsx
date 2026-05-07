"use client";

import React, { useEffect, useState } from "react";
import { Pickaxe, Timer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authedFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";

export default function MiningPage() {
  const { token } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<number>(4);

  useEffect(() => {
    const s = getSocket();
    const onProgress = (p: any) => setProgress(p);
    const onDiff = (d: any) => setDifficulty(Number(d));
    s.on("mining:progress", onProgress);
    s.on("difficulty:update", onDiff);
    return () => {
      s.off("mining:progress", onProgress);
      s.off("difficulty:update", onDiff);
    };
  }, []);

  const start = async () => {
    if (!token) return;
    await authedFetch("/api/tx/mine/start", token);
  };
  const stop = async () => {
    if (!token) return;
    await authedFetch("/api/tx/mine/stop", token);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pickaxe className="h-4 w-4 text-cyan-300" />
              Mining Controls
            </CardTitle>
            <CardDescription>Simulated PoW mining over mempool transactions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-white/70">
              Difficulty target: <span className="text-white">{difficulty}</span> leading zeros
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => void start()} disabled={!token}>
                Start Mining
              </Button>
              <Button className="flex-1" variant="secondary" onClick={() => void stop()} disabled={!token}>
                Stop
              </Button>
            </div>
            {!token && <div className="text-xs text-amber-200/80">Connect wallet to start mining.</div>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-cyan-300" />
              Live Hashing Telemetry
            </CardTitle>
            <CardDescription>Nonce increments, hash stream, speed estimate.</CardDescription>
          </CardHeader>
          <CardContent>
            {progress ? (
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/50">Miner</div>
                    <div className="mt-1 font-mono text-xs">{String(progress.miner).slice(0, 10)}…</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/50">Hashes/sec</div>
                    <div className="mt-1 text-lg font-semibold">{progress.hashesPerSecond}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/50">Attempts</div>
                    <div className="mt-1 text-lg font-semibold">{progress.attempts}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/50">Nonce</div>
                  <div className="mt-1 font-mono text-sm">{progress.nonce}</div>
                  <div className="mt-3 text-xs text-white/50">Latest hash</div>
                  <div className="mt-1 break-all font-mono text-xs text-cyan-100">{progress.hash}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/60">Waiting for mining telemetry…</div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

