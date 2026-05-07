import { Router } from "express";
import { nanoid } from "nanoid";
import { ethers } from "ethers";
import { z } from "zod";
import { adminWalletSet, env } from "../env.js";
import { signJwt } from "../middleware/auth.js";
import { UserModel } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const nonces = new Map<string, { nonce: string; issuedAt: number }>();
const admins = adminWalletSet();

export const authRouter = Router();

const RegisterUserSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    walletAddress: z.string().optional().default("")
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "password_mismatch",
    path: ["confirmPassword"]
  });

const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const LoginAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  walletAddress: z.string().optional().default("")
});

authRouter.post("/register-user", async (req, res) => {
  const parsed = RegisterUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });

  const email = parsed.data.email.toLowerCase();
  const wallet = parsed.data.walletAddress.trim().toLowerCase();
  if (wallet && !ethers.isAddress(wallet)) return res.status(400).json({ error: "invalid_wallet_address" });

  const exists = await UserModel.exists({ email });
  if (exists) return res.status(409).json({ error: "email_already_exists" });

  const user = await UserModel.create({
    fullName: parsed.data.fullName,
    email,
    passwordHash: hashPassword(parsed.data.password),
    walletAddress: wallet || `unlinked_${nanoid(10)}`,
    role: "USER",
    trustScore: 0.85,
    frozen: false,
    lastLoginAt: new Date()
  });

  const token = signJwt({ sub: user.walletAddress, role: user.role });
  return res.json({
    token,
    user: {
      walletAddress: user.walletAddress,
      role: user.role,
      trustScore: user.trustScore,
      frozen: user.frozen
    }
  });
});

authRouter.post("/login-user", async (req, res) => {
  const parsed = LoginUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const email = parsed.data.email.toLowerCase();
  const user = await UserModel.findOne({ email, role: "USER" });
  if (!user?.passwordHash) return res.status(401).json({ error: "invalid_credentials" });
  if (!verifyPassword(parsed.data.password, user.passwordHash)) return res.status(401).json({ error: "invalid_credentials" });
  if (user.frozen) return res.status(403).json({ error: "account_frozen" });

  user.lastLoginAt = new Date();
  await user.save();

  const token = signJwt({ sub: user.walletAddress, role: user.role });
  return res.json({
    token,
    user: {
      walletAddress: user.walletAddress,
      role: user.role,
      trustScore: user.trustScore,
      frozen: user.frozen
    }
  });
});

authRouter.post("/login-admin", async (req, res) => {
  const parsed = LoginAdminSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const email = parsed.data.email.toLowerCase();
  const isValid = email === env.ADMIN_EMAIL.toLowerCase() && parsed.data.password === env.ADMIN_PASSWORD;
  if (!isValid) return res.status(401).json({ error: "invalid_admin_credentials" });

  const wallet = parsed.data.walletAddress.trim().toLowerCase();
  if (wallet && !ethers.isAddress(wallet)) return res.status(400).json({ error: "invalid_wallet_address" });

  const adminWallet = wallet || env.ADMIN_WALLETS.split(",")[0]?.trim().toLowerCase() || `admin_${nanoid(10)}`;
  const adminUser = await UserModel.findOneAndUpdate(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    {
      $setOnInsert: {
        fullName: "DeFiSecure Admin",
        email: env.ADMIN_EMAIL.toLowerCase(),
        walletAddress: adminWallet
      },
      $set: { role: "ADMIN", lastLoginAt: new Date(), frozen: false }
    },
    { upsert: true, new: true }
  );

  const token = signJwt({ sub: adminUser.walletAddress, role: "ADMIN" });
  return res.json({
    token,
    user: {
      walletAddress: adminUser.walletAddress,
      role: adminUser.role,
      trustScore: adminUser.trustScore,
      frozen: adminUser.frozen
    }
  });
});

authRouter.get("/nonce", async (req, res) => {
  const address = String(req.query.address ?? "").toLowerCase();
  if (!ethers.isAddress(address)) return res.status(400).json({ error: "invalid_address" });
  const nonce = nanoid(24);
  nonces.set(address, { nonce, issuedAt: Date.now() });
  return res.json({
    address,
    nonce,
    message: `DeFiSecure Login\n\nWallet: ${address}\nNonce: ${nonce}\n\nSign this message to authenticate.`
  });
});

authRouter.post("/verify", async (req, res) => {
  const address = String(req.body?.address ?? "").toLowerCase();
  const signature = String(req.body?.signature ?? "");
  if (!ethers.isAddress(address)) return res.status(400).json({ error: "invalid_address" });
  if (!signature) return res.status(400).json({ error: "missing_signature" });

  const entry = nonces.get(address);
  if (!entry) return res.status(400).json({ error: "missing_nonce" });
  if (Date.now() - entry.issuedAt > 10 * 60 * 1000) return res.status(400).json({ error: "nonce_expired" });

  const message = `DeFiSecure Login\n\nWallet: ${address}\nNonce: ${entry.nonce}\n\nSign this message to authenticate.`;
  let recovered: string;
  try {
    recovered = ethers.verifyMessage(message, signature).toLowerCase();
  } catch {
    return res.status(400).json({ error: "bad_signature" });
  }
  if (recovered !== address) return res.status(400).json({ error: "signature_mismatch" });

  let isAdmin = admins.has(address);
  if (!isAdmin && env.AUTO_BOOTSTRAP_ADMIN && env.NODE_ENV !== "production") {
    const anyAdmin = await UserModel.exists({ role: "ADMIN" });
    if (!anyAdmin) isAdmin = true;
  }
  const user = await UserModel.findOneAndUpdate(
    { walletAddress: address },
    {
      $setOnInsert: { walletAddress: address },
      $set: { role: isAdmin ? "ADMIN" : "USER", lastLoginAt: new Date() }
    },
    { upsert: true, new: true }
  );

  if (user.frozen) return res.status(403).json({ error: "wallet_frozen" });

  nonces.delete(address);
  const token = signJwt({ sub: address, role: user.role });
  return res.json({
    token,
    user: {
      walletAddress: user.walletAddress,
      role: user.role,
      trustScore: user.trustScore,
      frozen: user.frozen
    }
  });
});

