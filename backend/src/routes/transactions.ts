import { Router } from "express";
import { z } from "zod";
import { engine } from "../engine.js";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../env.js";
import { TransactionModel } from "../models/Transaction.js";
import { FraudLogModel } from "../models/FraudLog.js";
import { UserModel } from "../models/User.js";

const SubmitSchema = z.object({
  kind: z.enum(["NATIVE", "ERC20"]).default("NATIVE"),
  to: z.string().min(1),
  amount: z.string().min(1),
  gasFeeWei: z.string().min(1),
  nonce: z.number().int().nonnegative(),
  signature: z.string().min(1),
  chainId: z.number().int().positive().default(31337)
});

async function scoreFraud(input: {
  from: string;
  to: string;
  amount: string;
  gasFeeWei: string;
  nonce: number;
  chainId: number;
}) {
  try {
    const r = await fetch(`${env.AI_ENGINE_URL}/score`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!r.ok) return { riskScore: 0.1, reason: "ai_unavailable" };
    return (await r.json()) as { riskScore: number; reason: string };
  } catch {
    return { riskScore: 0.1, reason: "ai_unavailable" };
  }
}

export const transactionsRouter = Router();

transactionsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = SubmitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });

  const from = req.auth!.sub.toLowerCase();
  const user = await UserModel.findOne({ walletAddress: from });
  if (user?.frozen) return res.status(403).json({ error: "wallet_frozen" });

  const fraud = await scoreFraud({ from, to: parsed.data.to, amount: parsed.data.amount, gasFeeWei: parsed.data.gasFeeWei, nonce: parsed.data.nonce, chainId: parsed.data.chainId });
  const riskScore = Math.max(0, Math.min(1, fraud.riskScore));

  const tx = engine.submitTx({
    kind: parsed.data.kind,
    from,
    to: parsed.data.to,
    amount: parsed.data.amount,
    gasFeeWei: parsed.data.gasFeeWei,
    nonce: parsed.data.nonce,
    signature: parsed.data.signature,
    chainId: parsed.data.chainId,
    riskScore
  });

  await TransactionModel.create({
    engineTxId: tx.id,
    chainId: tx.chainId,
    kind: tx.kind,
    from: tx.from,
    to: tx.to,
    amount: tx.amount,
    gasFeeWei: tx.gasFeeWei,
    nonce: tx.nonce,
    signature: tx.signature,
    status: tx.status,
    riskScore,
    refundDeadlineAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  if (riskScore >= 0.8) {
    await FraudLogModel.create({
      walletAddress: from,
      txEngineId: tx.id,
      riskScore,
      reason: fraud.reason || "high_risk"
    });
  }

  return res.json({ tx });
});

transactionsRouter.get("/mine/start", requireAuth, async (req, res) => {
  const miner = req.auth!.sub.toLowerCase();
  engine.startMining(miner);
  return res.json({ ok: true });
});

transactionsRouter.get("/mine/stop", requireAuth, async (_req, res) => {
  engine.stopMining();
  return res.json({ ok: true });
});

transactionsRouter.get("/history", requireAuth, async (req, res) => {
  const addr = req.auth!.sub.toLowerCase();
  const txs = await TransactionModel.find({ $or: [{ from: addr }, { to: addr }] })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return res.json({ txs });
});

