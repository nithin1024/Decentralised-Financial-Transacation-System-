import EventEmitter from "eventemitter3";
import { nanoid } from "nanoid";
import { leadingZeros, sha256Hex } from "./crypto.js";
import type { Block, SignedTx, TxStatus } from "./types.js";

export type EngineEvents = {
  "mempool:tx": (tx: SignedTx) => void;
  "mempool:update": (mempool: SignedTx[]) => void;
  "mining:progress": (p: {
    miner: string;
    attempts: number;
    nonce: number;
    hash: string;
    difficulty: number;
    txCount: number;
    hashesPerSecond: number;
  }) => void;
  "chain:block": (block: Block) => void;
  "chain:update": (chain: Block[]) => void;
  "tx:update": (tx: SignedTx) => void;
  "difficulty:update": (difficulty: number) => void;
};

export type DeFiSecureEngineConfig = {
  chainId: number;
  initialDifficulty: number;
  blockReward: string;
  maxTxPerBlock: number;
  miningTickMs: number;
};

const DEFAULTS: DeFiSecureEngineConfig = {
  chainId: 31337,
  initialDifficulty: 4,
  blockReward: "10",
  maxTxPerBlock: 25,
  miningTickMs: 250
};

export class DeFiSecureEngine {
  public readonly events = new EventEmitter<EngineEvents>();

  private difficulty: number;
  private readonly chainId: number;
  private readonly blockReward: string;
  private readonly maxTxPerBlock: number;
  private readonly miningTickMs: number;

  private chain: Block[] = [];
  private mempool: SignedTx[] = [];
  private miningTimer: NodeJS.Timeout | null = null;

  private miningState:
    | null
    | {
        miner: string;
        candidateTx: SignedTx[];
        nonce: number;
        attempts: number;
        startedAt: number;
        lastProgressAt: number;
        lastAttempts: number;
      } = null;

  constructor(cfg?: Partial<DeFiSecureEngineConfig>) {
    const c = { ...DEFAULTS, ...(cfg ?? {}) };
    this.chainId = c.chainId;
    this.difficulty = c.initialDifficulty;
    this.blockReward = c.blockReward;
    this.maxTxPerBlock = c.maxTxPerBlock;
    this.miningTickMs = c.miningTickMs;
    this.chain = [this.createGenesis()];
  }

  getState() {
    return {
      chainId: this.chainId,
      difficulty: this.difficulty,
      blockReward: this.blockReward,
      chain: [...this.chain],
      mempool: [...this.mempool],
      isMining: this.miningState !== null
    };
  }

  setDifficulty(difficulty: number) {
    const d = Math.max(1, Math.min(8, Math.floor(difficulty)));
    this.difficulty = d;
    this.events.emit("difficulty:update", d);
  }

  submitTx(input: Omit<SignedTx, "id" | "createdAt" | "status">): SignedTx {
    const tx: SignedTx = {
      ...input,
      id: `tx_${nanoid(16)}`,
      createdAt: Date.now(),
      status: "MEMPOOL"
    };
    this.mempool.unshift(tx);
    this.events.emit("mempool:tx", tx);
    this.events.emit("mempool:update", [...this.mempool]);
    return tx;
  }

  updateTxStatus(id: string, status: TxStatus, failureReason?: string) {
    const tx = this.mempool.find((t) => t.id === id) ?? this.findConfirmedTx(id);
    if (!tx) return;
    tx.status = status;
    if (failureReason) tx.failureReason = failureReason;
    this.events.emit("tx:update", { ...tx });
  }

  startMining(miner: string) {
    if (this.miningState) return;
    const candidateTx = this.mempool.slice(0, this.maxTxPerBlock).map((t) => ({ ...t, status: "MINING" as const }));
    for (const t of candidateTx) this.events.emit("tx:update", t);

    this.miningState = {
      miner,
      candidateTx,
      nonce: 0,
      attempts: 0,
      startedAt: Date.now(),
      lastProgressAt: Date.now(),
      lastAttempts: 0
    };

    this.miningTimer = setInterval(() => this.miningTick(), this.miningTickMs);
  }

  stopMining() {
    if (this.miningTimer) clearInterval(this.miningTimer);
    this.miningTimer = null;
    this.miningState = null;
  }

  private miningTick() {
    const s = this.miningState;
    if (!s) return;

    const previousHash = this.chain[this.chain.length - 1]?.hash ?? "0x0";
    const index = this.chain.length;
    const timestamp = Date.now();

    // Do some work each tick to simulate intensive hashing.
    const ITERATIONS = 15_000;
    let hash = "";
    for (let i = 0; i < ITERATIONS; i++) {
      s.nonce++;
      s.attempts++;
      hash = sha256Hex(
        JSON.stringify({
          index,
          timestamp,
          previousHash,
          nonce: s.nonce,
          miner: s.miner,
          txIds: s.candidateTx.map((t) => t.id),
          difficulty: this.difficulty
        })
      );
      if (leadingZeros(hash) >= this.difficulty) break;
    }

    const now = Date.now();
    const attemptsDelta = s.attempts - s.lastAttempts;
    const timeDeltaS = Math.max(0.001, (now - s.lastProgressAt) / 1000);
    const hashesPerSecond = Math.round(attemptsDelta / timeDeltaS);
    s.lastAttempts = s.attempts;
    s.lastProgressAt = now;

    this.events.emit("mining:progress", {
      miner: s.miner,
      attempts: s.attempts,
      nonce: s.nonce,
      hash,
      difficulty: this.difficulty,
      txCount: s.candidateTx.length,
      hashesPerSecond
    });

    if (leadingZeros(hash) < this.difficulty) return;

    const confirmed = s.candidateTx.map((t) => ({ ...t, status: "CONFIRMED" as const }));
    const block: Block = {
      index,
      timestamp,
      transactions: confirmed,
      nonce: s.nonce,
      previousHash,
      hash,
      miner: s.miner,
      reward: this.blockReward,
      difficulty: this.difficulty
    };

    // Remove confirmed tx from mempool
    const confirmedIds = new Set(confirmed.map((t) => t.id));
    this.mempool = this.mempool.filter((t) => !confirmedIds.has(t.id));
    for (const t of confirmed) this.events.emit("tx:update", t);
    this.events.emit("mempool:update", [...this.mempool]);

    this.chain.push(block);
    this.events.emit("chain:block", block);
    this.events.emit("chain:update", [...this.chain]);

    // Auto-continue mining if mempool still has tx
    this.stopMining();
    if (this.mempool.length > 0) this.startMining(s.miner);
  }

  private createGenesis(): Block {
    return {
      index: 0,
      timestamp: Date.parse("2026-01-01T00:00:00.000Z"),
      transactions: [],
      nonce: 0,
      previousHash: "0x0",
      hash: sha256Hex("defisecure_genesis"),
      miner: "SYSTEM",
      reward: "0",
      difficulty: this.difficulty
    };
  }

  private findConfirmedTx(id: string) {
    for (const b of this.chain) {
      const tx = b.transactions.find((t) => t.id === id);
      if (tx) return tx;
    }
    return undefined;
  }
}

