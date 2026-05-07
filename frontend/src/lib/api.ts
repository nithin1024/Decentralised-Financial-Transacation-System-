import { config } from "./config";

export type AuthUser = {
  walletAddress: string;
  role: "USER" | "ADMIN";
  trustScore: number;
  frozen: boolean;
};

export async function getNonce(address: string) {
  const r = await fetch(`${config.backendHttpUrl}/api/auth/nonce?address=${encodeURIComponent(address)}`, {
    cache: "no-store"
  });
  if (!r.ok) throw new Error("Failed to get nonce");
  return (await r.json()) as { address: string; nonce: string; message: string };
}

export async function verifySignature(address: string, signature: string) {
  const r = await fetch(`${config.backendHttpUrl}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, signature })
  });
  if (!r.ok) throw new Error("Auth failed");
  return (await r.json()) as { token: string; user: AuthUser };
}

export async function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  walletAddress: string;
}) {
  const r = await fetch(`${config.backendHttpUrl}/api/auth/register-user`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("User registration failed");
  return (await r.json()) as { token: string; user: AuthUser };
}

export async function loginUser(payload: { email: string; password: string }) {
  const r = await fetch(`${config.backendHttpUrl}/api/auth/login-user`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("Invalid email or password");
  return (await r.json()) as { token: string; user: AuthUser };
}

export async function loginAdmin(payload: { email: string; password: string; walletAddress?: string }) {
  const r = await fetch(`${config.backendHttpUrl}/api/auth/login-admin`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("Invalid admin credentials");
  return (await r.json()) as { token: string; user: AuthUser };
}

export async function authedFetch(path: string, token: string, init?: RequestInit) {
  const r = await fetch(`${config.backendHttpUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });
  return r;
}

