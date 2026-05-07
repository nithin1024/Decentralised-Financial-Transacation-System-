import { DeFiSecureEngine } from "@defisecure/blockchain-engine";

export const engine = new DeFiSecureEngine({
  chainId: 31337,
  initialDifficulty: 4,
  blockReward: "10",
  maxTxPerBlock: 25,
  miningTickMs: 250
});

