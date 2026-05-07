"use client";
import { useAuth } from "@/providers/auth-provider";

export default function WalletPage() {
  const { wallet, user } = useAuth();
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Wallet Overview</h1>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/60">Role: {user?.role}</div>
        <div className="mt-2 font-mono text-xs text-white/70">Address: {wallet?.address ?? "Not connected"}</div>
        <div className="mt-2 text-sm">Balance: {wallet ? `${Number(wallet.balanceEth).toFixed(4)} ETH` : "—"}</div>
      </div>
    </main>
  );
}

