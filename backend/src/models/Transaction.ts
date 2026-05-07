import mongoose, { Schema } from "mongoose";

export type TxStatus =
  | "PENDING"
  | "MEMPOOL"
  | "MINING"
  | "CONFIRMED"
  | "FAILED"
  | "REFUNDED";

export type TransactionDoc = {
  engineTxId: string;
  chainId: number;
  kind: "NATIVE" | "ERC20";
  from: string;
  to: string;
  amount: string;
  gasFeeWei: string;
  nonce: number;
  signature: string;
  status: TxStatus;
  createdAt: Date;
  updatedAt: Date;
  riskScore?: number;
  failureReason?: string;
  refundDeadlineAt?: Date;
  ipfsCid?: string;
};

const TransactionSchema = new Schema<TransactionDoc>(
  {
    engineTxId: { type: String, required: true, unique: true, index: true },
    chainId: { type: Number, required: true, index: true },
    kind: { type: String, required: true, enum: ["NATIVE", "ERC20"] },
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    amount: { type: String, required: true },
    gasFeeWei: { type: String, required: true },
    nonce: { type: Number, required: true },
    signature: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "MEMPOOL", "MINING", "CONFIRMED", "FAILED", "REFUNDED"],
      index: true
    },
    riskScore: { type: Number, required: false },
    failureReason: { type: String, required: false },
    refundDeadlineAt: { type: Date, required: false },
    ipfsCid: { type: String, required: false }
  },
  { timestamps: true }
);

export const TransactionModel = mongoose.model<TransactionDoc>("Transaction", TransactionSchema);

