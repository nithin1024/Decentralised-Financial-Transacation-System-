"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { connectWallet } from "@/lib/wallet";

export default function AdminAuthPage() {
  const router = useRouter();
  const { error, loginAsAdmin } = useAuth();
  const [form, setForm] = useState({ email: "admin@defisecure.local", password: "Admin@123", walletAddress: "" });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-2xl items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h1 className="text-xl font-semibold">Admin Authentication</h1>
        <p className="mt-1 text-sm text-white/60">Only predefined admin accounts are allowed.</p>
        <div className="mt-5 space-y-3">
          <input className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2" placeholder="Admin Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 pr-10"
              placeholder="Admin Password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <input className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs" placeholder="MetaMask wallet (optional verification)" value={form.walletAddress} readOnly />
            <button
              onClick={async () => {
                const w = await connectWallet();
                setForm((p) => ({ ...p, walletAddress: w.address }));
              }}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm"
            >
              Verify Wallet
            </button>
          </div>
          <button
            onClick={async () => {
              await loginAsAdmin(form);
              router.push("/admin");
            }}
            className="w-full rounded-lg bg-indigo-400 px-4 py-2 font-medium text-black"
          >
            Login as Admin
          </button>
        </div>
        {error && <div className="mt-4 text-sm text-amber-300">{error}</div>}
      </div>
    </main>
  );
}

