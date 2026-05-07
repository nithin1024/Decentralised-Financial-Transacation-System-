import mongoose, { Schema } from "mongoose";

export type BlockDoc = {
  index: number;
  timestamp: Date;
  nonce: number;
  previousHash: string;
  hash: string;
  miner: string;
  reward: string;
  difficulty: number;
  txEngineIds: string[];
};

const BlockSchema = new Schema<BlockDoc>(
  {
    index: { type: Number, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    nonce: { type: Number, required: true },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true, unique: true, index: true },
    miner: { type: String, required: true, index: true },
    reward: { type: String, required: true },
    difficulty: { type: Number, required: true },
    txEngineIds: { type: [String], required: true, default: [] }
  },
  { timestamps: true }
);

export const BlockModel = mongoose.model<BlockDoc>("Block", BlockSchema);

