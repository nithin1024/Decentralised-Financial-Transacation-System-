export type TxStatus =
  | "PENDING"
  | "MEMPOOL"
  | "MINING"
  | "CONFIRMED"
  | "FAILED"
  | "REFUNDED";

export type TxKind = "NATIVE" | "ERC20";

export type SignedTx = {
  id: string;
  kind: TxKind;
  from: string;
  to: string;
  amount: string;
  gasFeeWei: string;
  nonce: number;
  createdAt: number;
  signature: string;
  chainId: number;
  status: TxStatus;
  failureReason?: string;
  riskScore?: number;
};

export type Block = {
  index: number;
  timestamp: number;
  transactions: SignedTx[];
  nonce: number;
  previousHash: string;
  hash: string;
  miner: string;
  reward: string;
  difficulty: number;
};

