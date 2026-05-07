"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSocket } from "@/lib/socket";

export default function AnalyticsPage() {
  const [chain, setChain] = useState<any[]>([]);

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

  const data = useMemo(() => {
    const blocks = chain.slice(0).filter((b) => b.index !== 0);
    return blocks.map((b: any) => ({
      block: b.index,
      tx: (b.transactions ?? []).length,
      difficulty: b.difficulty
    }));
  }, [chain]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Real-time Analytics</h2>
        <p className="mt-1 text-sm text-white/60">Block throughput and difficulty trend (simulation).</p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Transactions per block</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="block" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Area type="monotone" dataKey="tx" stroke="#22d3ee" fill="rgba(34,211,238,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Trend</CardTitle>
            <CardDescription>Leading-zero target</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="block" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Area type="monotone" dataKey="difficulty" stroke="#a5b4fc" fill="rgba(165,180,252,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

