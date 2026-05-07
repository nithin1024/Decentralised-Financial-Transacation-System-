"use client";
import Link from "next/link";

export default function SendPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Send Money</h1>
      <p className="mt-2 text-sm text-white/60">Use the transaction composer on dashboard for signed transfer flow.</p>
      <Link href="/dashboard" className="mt-4 inline-block rounded-lg bg-cyan-400 px-4 py-2 text-black">
        Open Transaction Composer
      </Link>
    </main>
  );
}

