"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/lib/api";
import { getNonce, loginAdmin, loginUser, registerUser, verifySignature } from "@/lib/api";
import { connectWallet, ensureEthereum, signMessage, type WalletState } from "@/lib/wallet";

type AuthState = {
  wallet: WalletState | null;
  token: string | null;
  user: AuthUser | null;
  error: string | null;
  connectAndLogin: () => Promise<void>;
  registerWithEmail: (payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    walletAddress: string;
  }) => Promise<void>;
  loginWithEmail: (payload: { email: string; password: string }) => Promise<void>;
  loginAsAdmin: (payload: { email: string; password: string; walletAddress?: string }) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

const LS_TOKEN = "defisecure_jwt";
const LS_USER = "defisecure_user";
const LS_WALLET = "defisecure_wallet";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem(LS_TOKEN);
      const u = localStorage.getItem(LS_USER);
      const w = localStorage.getItem(LS_WALLET);
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      if (w) setWallet(JSON.parse(w));
    } catch {
      // ignore
    }
  }, []);

  const applySession = (session: { token: string; user: AuthUser }, w?: WalletState | null) => {
    setToken(session.token);
    setUser(session.user);
    if (w) {
      setWallet(w);
      localStorage.setItem(LS_WALLET, JSON.stringify(w));
    }
    localStorage.setItem(LS_TOKEN, session.token);
    localStorage.setItem(LS_USER, JSON.stringify(session.user));
    document.cookie = `defisecure_token=${session.token}; path=/; max-age=${12 * 60 * 60}; samesite=lax`;
    document.cookie = `defisecure_role=${session.user.role}; path=/; max-age=${12 * 60 * 60}; samesite=lax`;
  };

  const connectAndLogin = async () => {
    try {
      setError(null);
      const w = await connectWallet();
      const nonce = await getNonce(w.address);
      const sig = await signMessage(nonce.message);
      const v = await verifySignature(w.address, sig);
      applySession(v, w);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Wallet connection failed";
      setError(msg);
    }
  };

  const registerWithEmail = async (payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    walletAddress: string;
  }) => {
    try {
      setError(null);
      await registerUser(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    }
  };

  const loginWithEmail = async (payload: { email: string; password: string }) => {
    try {
      setError(null);
      const v = await loginUser(payload);
      applySession(v);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  };

  const loginAsAdmin = async (payload: { email: string; password: string; walletAddress?: string }) => {
    try {
      setError(null);
      const v = await loginAdmin(payload);
      applySession(v);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Admin login failed");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_WALLET);
    setWallet(null);
    document.cookie = "defisecure_token=; path=/; max-age=0";
    document.cookie = "defisecure_role=; path=/; max-age=0";
  };

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const eth = await ensureEthereum();
        const e = eth as unknown as {
          on?: (event: string, cb: (...args: unknown[]) => void) => void;
          removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
        };
        const onAccountsChanged = (accounts: unknown) => {
          if (!mounted) return;
          const list = Array.isArray(accounts) ? (accounts as string[]) : [];
          if (list.length === 0) {
            setWallet(null);
            localStorage.removeItem(LS_WALLET);
          }
        };
        const onChainChanged = () => {
          if (!mounted || !wallet) return;
          void connectWallet().then((w) => {
            setWallet(w);
            localStorage.setItem(LS_WALLET, JSON.stringify(w));
          });
        };
        e.on?.("accountsChanged", onAccountsChanged);
        e.on?.("chainChanged", onChainChanged);
      } catch {
        // MetaMask not available
      }
    })();
    return () => {
      mounted = false;
    };
  }, [wallet]);

  const value = useMemo<AuthState>(
    () => ({ wallet, token, user, error, connectAndLogin, registerWithEmail, loginWithEmail, loginAsAdmin, logout }),
    [wallet, token, user, error]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

