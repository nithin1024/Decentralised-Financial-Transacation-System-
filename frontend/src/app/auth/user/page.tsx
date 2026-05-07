"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export default function UserAuthPage() {
  const router = useRouter();
  const { error, registerWithEmail, loginWithEmail, connectAndLogin } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [register, setRegister] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="mb-6 flex gap-2">
          <button onClick={() => setTab("login")} className={`rounded-lg px-4 py-2 text-sm ${tab === "login" ? "bg-cyan-400 text-black" : "bg-white/10 text-white"}`}>Login</button>
          <button onClick={() => setTab("register")} className={`rounded-lg px-4 py-2 text-sm ${tab === "register" ? "bg-cyan-400 text-black" : "bg-white/10 text-white"}`}>Register</button>
        </div>

        {tab === "login" ? (
          <div className="space-y-3">
            <input className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2" placeholder="Email" value={login.email} onChange={(e) => setLogin((p) => ({ ...p, email: e.target.value }))} />
            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 pr-10"
                placeholder="Password"
                value={login.password}
                onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
              >
                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={async () => {
                await loginWithEmail(login);
                router.push("/dashboard");
              }}
              className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-medium text-black"
            >
              Login as User
            </button>
            <button
              onClick={async () => {
                await connectAndLogin();
                router.push("/dashboard");
              }}
              className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm"
            >
              Login with MetaMask
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2" placeholder="Full Name" value={register.fullName} onChange={(e) => setRegister((p) => ({ ...p, fullName: e.target.value }))} />
            <input className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2" placeholder="Email" value={register.email} onChange={(e) => setRegister((p) => ({ ...p, email: e.target.value }))} />
            <div className="relative">
              <input
                type={showRegisterPassword ? "text" : "password"}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 pr-10"
                placeholder="Password"
                value={register.password}
                onChange={(e) => setRegister((p) => ({ ...p, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
              >
                {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showRegisterConfirmPassword ? "text" : "password"}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 pr-10"
                placeholder="Confirm Password"
                value={register.confirmPassword}
                onChange={(e) => setRegister((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowRegisterConfirmPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
              >
                {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={async () => {
                await registerWithEmail({ ...register, walletAddress: "" });
                setTab("login");
              }}
              className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-medium text-black"
            >
              Register as User
            </button>
          </div>
        )}
        {error && <div className="mt-4 text-sm text-amber-300">{error}</div>}
      </div>
    </main>
  );
}

