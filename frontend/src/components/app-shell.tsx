"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Blocks, ChartNoAxesCombined, Cog, Cpu, FileSearch, Home, Pickaxe, Send, Shield, User, Users, Vote, Wallet } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

const publicRoutes = ["/", "/auth", "/auth/user", "/auth/admin"];

const userMenu = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/send", label: "Send Money", icon: Send },
  { href: "/transactions", label: "Transactions", icon: FileSearch },
  { href: "/track", label: "Track Transaction", icon: Cpu },
  { href: "/explorer", label: "Explorer", icon: Blocks },
  { href: "/staking", label: "Staking", icon: Vote },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User }
];

const adminMenu = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: FileSearch },
  { href: "/admin/mempool", label: "Mempool", icon: Cpu },
  { href: "/mining", label: "Mining", icon: Pickaxe },
  { href: "/admin/blockchain", label: "Blockchain", icon: Blocks },
  { href: "/explorer", label: "Explorer", icon: Blocks },
  { href: "/admin/contracts", label: "Smart Contracts", icon: Shield },
  { href: "/admin/fraud", label: "Fraud Analytics", icon: Shield },
  { href: "/admin/governance", label: "Governance", icon: Vote },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/admin/settings", label: "Settings", icon: Cog }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, wallet, connectAndLogin, logout } = useAuth();

  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith("/auth/"));
  const isAuthed = Boolean(user);

  useEffect(() => {
    if (!isPublic && !isAuthed) router.replace("/auth");
    if (pathname.startsWith("/admin") && user?.role !== "ADMIN") router.replace("/dashboard");
  }, [isAuthed, isPublic, pathname, router, user?.role]);

  const menu = useMemo(() => (user?.role === "ADMIN" ? adminMenu : userMenu), [user?.role]);

  if (!isAuthed || isPublic) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-3 md:block">
          <div className="mb-2 px-3 text-xs text-white/50">{user?.role} MENU</div>
          <div className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={`${item.label}-${item.href}`} href={item.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button onClick={logout} className="mt-2 w-full rounded-lg bg-white/10 px-3 py-2 text-left text-sm hover:bg-white/15">
              Logout
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {user.role === "USER" && !wallet && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6">
            <h3 className="text-lg font-semibold">Connect Your MetaMask Wallet</h3>
            <p className="mt-2 text-sm text-white/60">Wallet connection is required to send on-chain transactions.</p>
            <Button className="mt-5 w-full" onClick={() => void connectAndLogin()}>
              Connect Wallet
            </Button>
            <button className="mt-2 w-full rounded-lg bg-white/10 py-2 text-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

