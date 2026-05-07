import { Router } from "express";
import { z } from "zod";
import { engine } from "../engine.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { UserModel } from "../models/User.js";
import { TransactionModel } from "../models/Transaction.js";
import { FraudLogModel } from "../models/FraudLog.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/users", async (_req, res) => {
  const users = await UserModel.find().sort({ createdAt: -1 }).limit(500).lean();
  return res.json({ users });
});

adminRouter.post("/users/freeze", async (req, res) => {
  const Body = z.object({ walletAddress: z.string().min(1), frozen: z.boolean() });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });
  const walletAddress = parsed.data.walletAddress.toLowerCase();
  const user = await UserModel.findOneAndUpdate({ walletAddress }, { $set: { frozen: parsed.data.frozen } }, { new: true });
  return res.json({ user });
});

adminRouter.delete("/users/:walletAddress", async (req, res) => {
  const walletAddress = String(req.params.walletAddress ?? "").toLowerCase();
  if (!walletAddress) return res.status(400).json({ error: "invalid_wallet" });
  const deleted = await UserModel.findOneAndDelete({ walletAddress });
  return res.json({ deleted: Boolean(deleted) });
});

adminRouter.get("/transactions", async (_req, res) => {
  const txs = await TransactionModel.find().sort({ createdAt: -1 }).limit(500).lean();
  return res.json({ txs });
});

adminRouter.post("/transactions/:engineTxId/refund", async (req, res) => {
  const engineTxId = String(req.params.engineTxId ?? "");
  if (!engineTxId) return res.status(400).json({ error: "invalid_tx" });
  const tx = await TransactionModel.findOne({ engineTxId });
  if (!tx) return res.status(404).json({ error: "tx_not_found" });
  tx.status = "REFUNDED";
  tx.failureReason = tx.failureReason ?? "admin_refund_override";
  await tx.save();
  engine.updateTxStatus(engineTxId, "REFUNDED", tx.failureReason);
  return res.json({ ok: true, tx });
});

adminRouter.post("/transactions/:engineTxId/retry", async (req, res) => {
  const engineTxId = String(req.params.engineTxId ?? "");
  if (!engineTxId) return res.status(400).json({ error: "invalid_tx" });
  const tx = await TransactionModel.findOne({ engineTxId });
  if (!tx) return res.status(404).json({ error: "tx_not_found" });
  tx.status = "MEMPOOL";
  tx.failureReason = undefined;
  tx.refundDeadlineAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await tx.save();
  engine.updateTxStatus(engineTxId, "MEMPOOL");
  return res.json({ ok: true, tx });
});

adminRouter.get("/fraud", async (_req, res) => {
  const logs = await FraudLogModel.find().sort({ createdAt: -1 }).limit(500).lean();
  return res.json({ logs });
});

adminRouter.post("/difficulty", async (req, res) => {
  const Body = z.object({ difficulty: z.number().int().min(1).max(8) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });
  engine.setDifficulty(parsed.data.difficulty);
  return res.json({ ok: true, difficulty: parsed.data.difficulty });
});

