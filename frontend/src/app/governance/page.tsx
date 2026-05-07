"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GovernancePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">DAO Governance</h2>
        <p className="mt-1 text-sm text-white/60">Proposal creation and token-weighted voting (contract-backed).</p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Proposals</CardTitle>
            <CardDescription>Connect your wallet to create and vote.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-white/70">
            In this scaffold, governance contracts deploy locally via Hardhat. Next step is wiring the UI to the deployed
            contract addresses and indexing on-chain events into the backend for real-time updates.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>On-chain Execution</CardTitle>
            <CardDescription>Admin executes accepted proposals.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-white/70">
            Execution is gated and logged; accepted proposals require quorum. This module pairs with the admin dashboard
            for moderation and emergency controls.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

