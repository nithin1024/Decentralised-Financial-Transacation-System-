# Hybrid Decentralized Financial Ecosystem (HDFE)

Welcome to the **Hybrid Decentralized Financial Ecosystem**. This project is a comprehensive, multi-layer blockchain and decentralized finance (DeFi) simulation. It is designed to demonstrate core blockchain cryptography, peer-to-peer networking, and Ethereum Web3 smart contract integration—all operating entirely offline.

---

## 🚀 How to Run and Work on This Project

This project requires **zero external dependencies** and no complex build steps (no Node.js packages to install, no React/Vite builds). It is built using pure HTML, CSS, and Vanilla JavaScript with bundled libraries.

### Step 1: Start the Local Server
Because the project uses ES6 Modules and fetches local files, it must be run over a local web server (not just double-clicking the HTML file).
1. Open your terminal in the root of the `Blockchain` folder.
2. Run a simple HTTP server. For example:
   ```bash
   npx http-server -p 5500 .
   ```
   *(Alternatively, you can use `python -m http.server 5500` or the VS Code "Live Server" extension).*

### Step 2: Access the Platform
1. Open your browser and navigate **strictly** to: **http://localhost:5500** 
   *(Do NOT use `127.0.0.1` as MetaMask enforces strict security policies on IP addresses vs hostnames).*
2. You will land on the **Dashboard (index.html)**.

### Step 3: Configure Your Wallets
1. Navigate to the **Wallet (Web3)** page.
2. **Layer 1:** Click **Generate New L1 Wallet**. This creates an offline cryptographic Public/Private key pair used for the custom JavaScript blockchain.
3. **Layer 3:** Click **Connect MetaMask**. This will prompt your browser extension to connect. *(Ensure your MetaMask is connected to a local Ganache instance or a testnet like Sepolia).*

### Step 4: Test the Ecosystem (Step-by-Step)
1. **Send Funds:** Go to the **Transfer** page. Use your L1 wallet to sign a transaction to a dummy address.
2. **Mine the Block:** Go to the **Mining** page. You will see your transaction in the "Pending Pool". Click **Begin PoW Mining**. The system will perform SHA-256 calculations to solve the block.
3. **Verify Ledger:** Go to the **Explorer** page. You will see the immutable ledger, the newly generated Merkle Root, and your confirmed transaction.
4. **Smart Contracts:** Go to the **Contracts** page to interact directly with Solidity smart contracts via your connected MetaMask wallet.

---

## 🏗️ System Architecture & Components

The HDFE is divided into **Three Core Layers**:

### 🔹 Layer 1: Custom Blockchain Engine (`/blockchain`, `/utils`)
A fully functional blockchain built from scratch in JavaScript to demonstrate low-level mechanics.
- **`crypto.js`**: Contains a pure, synchronous SHA-256 hashing algorithm. Generates offline key pairs and digital signatures.
- **`merkle.js`**: Implements Merkle Trees to compress transaction data into a single root hash, ensuring data integrity.
- **`block.js`**: Defines the block structure (`index`, `timestamp`, `merkleRoot`, `previousHash`, `nonce`). Contains the Proof-of-Work (PoW) mining loop.
- **`blockchain.js`**: The core engine. Handles the chain state, validates double-spending, manages difficulty, and resolves the longest chain (Fork resolution).

### 🔹 Layer 2: Network & P2P Simulation (`/network`)
- **`node.js`**: Simulates a peer-to-peer distributed network. It spins up 3 virtual nodes (Main, Validator, Backup). Nodes communicate via a gossip protocol to broadcast transactions and synchronize mined blocks.

### 🔹 Layer 3: Ethereum & Smart Contracts (`/web3`, `/contracts`)
Integrates the traditional Ethereum Web3 stack for advanced DeFi operations.
- **`metamask.js`**: Securely injects `window.ethereum`, handles account detection, balance fetching, and transaction signing.
- **`contract.js`**: Uses a bundled offline `ethers.min.js` library to interact with compiled Solidity contracts.
- **Solidity Contracts (`/contracts`)**:
  - `escrow.sol`: Trustless payer-to-arbiter-to-payee locking mechanism.
  - `loan.sol`: Over-collateralized lending and borrowing system.
  - `token.sol`: ERC-20 compatible custom asset interface.
  - `supplychain.sol`: Product lifecycle tracker logging state changes immutably.

---

## 🖥️ Frontend Modules (The 8 Pages)

All UI pages are located in `/frontend/pages/` and styled via `/css/style.css` using modern glassmorphism design.

1. **`index.html` (Dashboard)**: Central hub showing network telemetry, active nodes, and current block heights.
2. **`wallet.html`**: Dual identity manager for L1 local keys and L3 MetaMask accounts.
3. **`transaction.html`**: Cross-layer transfer interface.
4. **`blockchain.html` (Explorer)**: Visualizes the immutable ledger, showing how blocks are cryptographically linked.
5. **`mining.html`**: Real-time PoW simulation terminal. Adjust network difficulty and watch the hash brute-forcing live.
6. **`contracts.html`**: Smart Contract playground. Execute `deposit()`, `release()`, `transfer()`, and `requestLoan()` via Web3.
7. **`applications.html`**: Demonstrates industry-specific use cases (Supply Chain, Banking, Health Insurance) and explains network risks (Scalability, Energy).
8. **`analytics.html`**: Graphical charts powered by `chart.min.js` showing Block Growth and Transactions-per-Block metrics over time.

---

## 📚 Academic Concept Coverage

This project strictly adheres to theoretical blockchain concepts:
- **Unit 1 (Fundamentals):** Showcases Keys as Identity, Digital Signatures, SHA-256 Hashing, and PoW Consensus in `blockchain.js` and `crypto.js`.
- **Unit 2 (Applications):** The `applications.html` module conceptualizes Trade Finance, Supply Chain tracking, and analyzes architectural risks like Latency and Energy Consumption.
- **Unit 3 (Deployment & Advanced):** Features a live Mining system, Fork resolution logic, Merkle Trees (SegWit foundation), and direct Smart Contract execution via Web3.

---

*Note: The `libs/` folder contains offline versions of `ethers.min.js` and `chart.min.js` to ensure the project works perfectly in completely offline, sandboxed environments.*
