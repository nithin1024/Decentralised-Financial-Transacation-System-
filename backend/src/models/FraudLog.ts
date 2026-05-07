import mongoose, { Schema } from "mongoose";

export type FraudLogDoc = {
  walletAddress: string;
  txEngineId?: string;
  riskScore: number;
  reason: string;
  createdAt: Date;
};

const FraudLogSchema = new Schema<FraudLogDoc>(
  {
    walletAddress: { type: String, required: true, index: true },
    txEngineId: { type: String, required: false, index: true },
    riskScore: { type: Number, required: true, index: true },
    reason: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const FraudLogModel = mongoose.model<FraudLogDoc>("FraudLog", FraudLogSchema);

