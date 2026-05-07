"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, UserRound } from "lucide-react";

export default function AuthPortalPage() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-24 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>
      <div className="relative w-full">
        <h1 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Login As</h1>
        <p className="mt-2 text-center text-sm text-white/60">Choose your portal to continue into DeFiSecure.</p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
          <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 inline-flex rounded-xl bg-cyan-400/15 p-3 text-cyan-200">
              <UserRound className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">User Portal</h3>
            <p className="mt-2 text-sm text-white/60">Register/login and manage personal wallet transactions.</p>
            <Link href="/auth/user" className="mt-5 inline-flex rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-900">
              Continue as User
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 inline-flex rounded-xl bg-indigo-400/15 p-3 text-indigo-200">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Admin Portal</h3>
            <p className="mt-2 text-sm text-white/60">Restricted access for operational and governance controls.</p>
            <Link href="/auth/admin" className="mt-5 inline-flex rounded-lg bg-indigo-400 px-4 py-2 text-sm font-medium text-slate-900">
              Continue as Admin
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

