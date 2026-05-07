import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectDb } from "./db.js";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { engineRouter } from "./routes/engine.js";
import { transactionsRouter } from "./routes/transactions.js";
import { adminRouter } from "./routes/admin.js";
import { engine } from "./engine.js";
import { BlockModel } from "./models/Block.js";
import { TransactionModel } from "./models/Transaction.js";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 300
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/engine", engineRouter);
app.use("/api/tx", transactionsRouter);
app.use("/api/admin", adminRouter);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: env.CORS_ORIGIN, credentials: true }
});

io.on("connection", (socket) => {
  socket.emit("engine:state", engine.getState());
});

// Bridge engine events -> sockets + Mongo persistence
engine.events.on("mempool:update", (mempool) => {
  io.emit("mempool:update", mempool);
});
engine.events.on("mempool:tx", (tx) => {
  io.emit("mempool:tx", tx);
});
engine.events.on("mining:progress", (p) => {
  io.emit("mining:progress", p);
});
engine.events.on("difficulty:update", (d) => {
  io.emit("difficulty:update", d);
});
engine.events.on("tx:update", async (tx) => {
  io.emit("tx:update", tx);
  await TransactionModel.updateOne(
    { engineTxId: tx.id },
    { $set: { status: tx.status, failureReason: tx.failureReason } }
  );
});
engine.events.on("chain:block", async (block) => {
  io.emit("chain:block", block);
  await BlockModel.updateOne(
    { hash: block.hash },
    {
      $setOnInsert: {
        index: block.index,
        timestamp: new Date(block.timestamp),
        nonce: block.nonce,
        previousHash: block.previousHash,
        hash: block.hash,
        miner: block.miner,
        reward: block.reward,
        difficulty: block.difficulty,
        txEngineIds: block.transactions.map((t) => t.id)
      }
    },
    { upsert: true }
  );
});
engine.events.on("chain:update", (chain) => {
  io.emit("chain:update", chain);
});

// Auto-refund worker (enterprise demo)
async function refundSweep() {
  const now = new Date();
  const stuck = await TransactionModel.find({
    status: { $in: ["MEMPOOL", "MINING", "PENDING"] },
    refundDeadlineAt: { $lte: now }
  })
    .sort({ createdAt: 1 })
    .limit(100);

  for (const tx of stuck) {
    tx.status = "REFUNDED";
    tx.failureReason = tx.failureReason ?? "auto_refund_timeout";
    await tx.save();
    engine.updateTxStatus(tx.engineTxId, "REFUNDED", tx.failureReason);
    io.emit("refund:tx", { engineTxId: tx.engineTxId, reason: tx.failureReason });
  }
}

setInterval(() => {
  refundSweep().catch(() => {});
}, 30_000);

await connectDb();
server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`DeFiSecure backend listening on :${env.PORT}`);
});

