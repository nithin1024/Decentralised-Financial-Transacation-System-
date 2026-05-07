import Link from "next/link";
import { Shield, UserRound } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-16 right-1/4 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>
      <section className="relative mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-center text-3xl font-semibold md:text-4xl">Login As</h1>
        <p className="mt-2 text-center text-sm text-white/60">Choose your secure portal to continue.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/auth/user" className="rounded-2xl border border-white/10 bg-black/20 p-6 transition hover:-translate-y-0.5 hover:border-cyan-300/40">
            <div className="mb-3 inline-flex rounded-lg bg-cyan-400/15 p-2 text-cyan-200">
              <UserRound className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">User</h3>
            <p className="mt-1 text-sm text-white/60">Register/login and access user financial dashboard.</p>
          </Link>
          <Link href="/auth/admin" className="rounded-2xl border border-white/10 bg-black/20 p-6 transition hover:-translate-y-0.5 hover:border-indigo-300/40">
            <div className="mb-3 inline-flex rounded-lg bg-indigo-400/15 p-2 text-indigo-200">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Admin</h3>
            <p className="mt-1 text-sm text-white/60">Restricted portal for system-wide control and analytics.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}

