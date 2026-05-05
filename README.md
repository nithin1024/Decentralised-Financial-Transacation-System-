# Decentralized Financial Transaction System using Blockchain and MetaMask

This is a complete, production-quality Decentralized Application (DApp) that allows users to seamlessly connect their MetaMask wallet, send ETH to another address, and view their continuous transaction history securely stored on the blockchain.

## ✨ Features
- **Modern UI**: Polished glassmorphism styles built with React, Vite, Framer Motion, and Tailwind CSS.
- **Smart Contracts**: Bulletproof Solidity contracts interacting flawlessly with the Ethereum Blockchain.
- **DApp Integration**: Native connection to the user's browser Wallet (MetaMask) using Ethers.js.
- **Advanced Validation**: Input checking for valid Ethereum Addresses and insufficient token balances before transacting.
- **Robust Error Handling**: Toast architecture elegantly capturing & explaining MetaMask rejections, unconfigured addresses, missing funds, and network mismatches.
- **Network Synchronization**: React seamlessly detects, warns, and prompts the user inside their wallet to auto-switch to Sepolia Testnet if they are connected to Mainnet or an Invalid Chain.
- **Transaction Modal Receipts**: Detailed success dialogues allowing quick "View on Etherscan" links connected directly to the user's executed Transaction Hash.
- **Asymmetric Loading States**: Disables forms and shows asynchronous loading metrics during block-confirmations.

---

## 🚀 Quick Setup Instructions

We've configured the project using a "mono-repo" style root setup so you can run frontend and blockchain commands painlessly from the same root folder.

### 1. Install Everything
Open a terminal in the root folder (`Blockchain/`) and run this command. It installs the necessary packages for both the `client` and `blockchain` folders all at once!
```bash
npm run install:all
```

### 2. Configure Environment Variables (`.env`)
You need to put your secret keys in environment files before the application can start working correctly.

**For the Blockchain (`blockchain/.env`):**
1. Rename `blockchain/.env.example` to `.env`.
2. Open it and add your details:
   - `PRIVATE_KEY`: Your MetaMask wallet's private key (make sure this wallet has testnet ETH). **DO NOT share this online.**
   - `SEPOLIA_RPC_URL`: An RPC URL (like Alchemy or Infura) pointing to the Sepolia network.

**For the Client (`client/.env`):**
1. Rename `client/.env.example` to `.env`.
2. Add the `VITE_CONTRACT_ADDRESS` (you will obtain this in Step 3).

---

### 3. Compile and Deploy the Smart Contract
From your root folder terminal, compile your smart contract first:
```bash
npm run compile:contract
```

Now, deploy it to a live network (Sepolia) OR test it entirely locally.

#### Option A: Deploy to Sepolia (Test Network)
```bash
npm run deploy:sepolia
```
*Note: This costs testnet-ETH (gas). Make sure your `.env` is setup properly!*

#### Option B: Deploy to Localhost (Offline testing)
1. In Terminal 1, start the local node (leave this running):
   ```bash
   npm run node:local
   ```
2. In Terminal 2, deploy to the local network:
   ```bash
   npm run deploy:local
   ```

**⚠️ IMPORTANT**: Once deployed using either method, your terminal will spit out an address (e.g., `TransactionContract deployed to: 0x...`). Copy that address and save it into your `client/.env` file like this:
```env
VITE_CONTRACT_ADDRESS="0x123...abc"
```

---

### 4. Start the Application
Once you've saved the deployed contract address into `client/.env`, restart your React Server to apply the new `.env` change:

```bash
# Run this from the root directory
npm run dev:client
```

Open the terminal link (usually `http://localhost:5173/`) in your browser to interact safely with the Web3 app!

---

## 🔧 Frequently Asked Questions

**Q: I instantly get a "Transaction failed" toast with an Error in the Dev Console roughly stating `an ENS name used for a contract target must be correctly configured`.**
> A: Your frontend can't find your `.env` Address, so it is falling back to placeholder text. Make sure you entered your deployed `0x...` contract address inside `client/.env` properly. If you *just* updated the `.env` file, **you must restart** your `npm run dev:client` server to pick up the change!

**Q: I get `HardhatError: HH117: Empty string '' for network` when trying to deploy.**
> A: You are trying to deploy to Sepolia without entering a valid RPC Node in `blockchain/.env`. Go to Alchemy.com, make an app, get your API Key, and paste it under `SEPOLIA_RPC_URL`.
