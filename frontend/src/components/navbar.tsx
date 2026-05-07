"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const nav = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explorer", label: "Explorer" },
  { href: "/mining", label: "Mining" },
  { href: "/governance", label: "Governance" },
  { href: "/analytics", label: "Analytics" }
];

export function Navbar() {
  const pathname = usePathname();
  const { wallet, user, error, connectAndLogin, logout } = useAuth();

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Shield className="h-5 w-5 text-cyan-400" />
          <span>DeFiSecure</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white",
                pathname === n.href && "bg-white/10 text-white"
              )}
            >
              {n.label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white",
                pathname === "/admin" && "bg-white/10 text-white"
              )}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="hidden text-xs text-amber-300 sm:block">{error}</span>}
          {wallet ? (
            <>
              <div className="hidden text-xs text-white/70 sm:block">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono">{wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}</span>
                  <span className="text-white/40">·</span>
                  <span>{Number(wallet.balanceEth).toFixed(4)} ETH</span>
                </div>
              </div>
              <Button variant="secondary" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <Button onClick={() => void connectAndLogin()}>Connect Wallet</Button>
          )}
        </div>
      </div>
    </div>
  );
}

