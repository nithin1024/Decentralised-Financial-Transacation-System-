import { ethers } from "ethers";

export type WalletState = {
  address: string;
  chainId: number;
  balanceEth: string;
};

export async function ensureEthereum() {
  const eth = (globalThis as unknown as { ethereum?: unknown }).ethereum;
  if (!eth) throw new Error("MetaMask not detected. Install/enable MetaMask and refresh.");
  return eth as ethers.Eip1193Provider;
}

export async function connectWallet(): Promise<WalletState> {
  const provider = new ethers.BrowserProvider(await ensureEthereum());
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = (await signer.getAddress()).toLowerCase();
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(address);
  return {
    address,
    chainId: Number(network.chainId),
    balanceEth: ethers.formatEther(balance)
  };
}

export async function signMessage(message: string) {
  const provider = new ethers.BrowserProvider(await ensureEthereum());
  const signer = await provider.getSigner();
  return await signer.signMessage(message);
}

