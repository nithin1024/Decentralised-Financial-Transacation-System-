# DeFiSecure - Decentralized Financial Transaction System Using Blockchain

Enterprise-style full-stack Web3 platform with role-based authentication, MetaMask integration, proof-of-work mining simulation, real-time mempool updates, explorer pages, AI fraud scoring, and smart contracts.

## Repository

- GitHub: [nithin1024/Decentralised-Financial-Transacation-System-](https://github.com/nithin1024/Decentralised-Financial-Transacation-System-)

## Current Localhost Links

- Frontend (Next.js): `http://localhost:3000`
- Backend API + Socket.IO: `http://127.0.0.1:8081`
- AI Engine (FastAPI): `http://127.0.0.1:8000`
- Backend health: `http://127.0.0.1:8081/health`
- AI health: `http://127.0.0.1:8000/health`

## Monorepo Structure

```text
frontend/            # Next.js 15 app (auth portal, user/admin pages, dashboards)
backend/             # Express + Socket.IO + JWT + MongoDB APIs
blockchain-engine/   # PoW chain + mempool + mining simulation engine
smart-contracts/     # Hardhat + Solidity contracts (DST, staking, governance, escrow)
ai-engine/           # FastAPI fraud scoring service (Isolation Forest baseline)
```

## Tech Stack

- Frontend: Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion, Recharts, ethers
- Backend: Node.js, Express, Socket.IO, JWT, Mongoose, Zod
- Blockchain: Solidity, Hardhat, OpenZeppelin
- AI: Python, FastAPI, scikit-learn (extensible for TensorFlow autoencoders)
- Database: MongoDB

## Environment Setup

### 1) Backend `.env` (`backend/.env`)

```env
NODE_ENV=development
PORT=8081
MONGODB_URI=mongodb://127.0.0.1:27017/defisecure
JWT_SECRET=dev_only_change_me_please_32chars
CORS_ORIGIN=http://localhost:3000
AI_ENGINE_URL=http://127.0.0.1:8000
ADMIN_WALLETS=
ADMIN_EMAIL=admin@defisecure.local
ADMIN_PASSWORD=Admin@123
AUTO_BOOTSTRAP_ADMIN=true
```

### 2) Frontend `.env.local` (`frontend/.env.local`)

```env
NEXT_PUBLIC_BACKEND_HTTP_URL=http://127.0.0.1:8081
NEXT_PUBLIC_BACKEND_WS_URL=http://127.0.0.1:8081
```

### 3) AI requirements (`ai-engine/requirements.txt`)

Install with:

```bash
python -m pip install -r requirements.txt
```

## Run the Full Platform (Local)

Open separate terminals:

### A. AI Engine

```bash
cd ai-engine
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### B. Backend API + Realtime

```bash
cd backend
npm install
npm run dev
```

### C. Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Authentication Flow

1. App opens to full-screen auth portal: **Select Your Role**
2. User portal:
   - Register (name, email, password, confirm)
   - Login (email + password)
3. Admin portal:
   - Predefined admin login only (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
4. After login:
   - Shell (navbar/sidebar) appears
   - USER gets wallet connect modal if MetaMask is not connected
5. Role routes:
   - `/admin/*` blocked for non-admin users (middleware + client guard)

## Feature Summary

- Role-based dashboards and route isolation (USER vs ADMIN)
- MetaMask wallet connection after login
- Transaction submission flow with signature
- Realtime mempool/mining/block updates using Socket.IO
- PoW mining simulation with nonce/hash progress
- Blockchain explorer and analytics charts
- Admin controls: difficulty changes, fraud reports, user freeze, retry/refund actions
- Auto-refund worker for stale transactions

## Smart Contracts

Contracts in `smart-contracts/contracts`:

- `DeFiSecureToken.sol` (DST token)
- `StakingVault.sol`
- `DAOGovernance.sol`
- `EscrowRefund.sol`
- `MiningRewards.sol`

### Compile and deploy locally

```bash
cd smart-contracts
npm install
npm run compile
npm run node
# in another terminal:
npm run deploy:local
```

## API Documentation (Core)

### Auth

- `GET /api/auth/nonce?address=0x...`
- `POST /api/auth/verify`
- `POST /api/auth/register-user`
- `POST /api/auth/login-user`
- `POST /api/auth/login-admin`

### Transactions

- `POST /api/tx`
- `GET /api/tx/history`
- `GET /api/tx/mine/start`
- `GET /api/tx/mine/stop`

### Admin

- `GET /api/admin/users`
- `POST /api/admin/users/freeze`
- `DELETE /api/admin/users/:walletAddress`
- `GET /api/admin/transactions`
- `POST /api/admin/transactions/:engineTxId/retry`
- `POST /api/admin/transactions/:engineTxId/refund`
- `GET /api/admin/fraud`
- `POST /api/admin/difficulty`

## Testing Checklist

1. Start AI, backend, frontend services.
2. Open auth portal and login as User.
3. Submit a transaction from Dashboard.
4. Open Mining page and start mining.
5. Confirm block/tx updates in Explorer.
6. Login as Admin and test:
   - view users
   - freeze/unfreeze
   - difficulty update
   - fraud dashboard
7. Leave tx pending to validate refund pipeline.

## Security Notes

- JWT-based API auth
- Role-based route and API guards
- Password hashing using scrypt
- Helmet + rate limiting + input validation
- Reentrancy-safe Solidity patterns in staking/escrow contracts

## Deployment Guide (High Level)

1. Deploy MongoDB (Atlas/local)
2. Deploy backend (Node runtime)
3. Deploy frontend (Vercel/Node server)
4. Deploy AI service (FastAPI + Uvicorn)
5. Deploy smart contracts to target chain
6. Update env vars for endpoints and contract addresses

---

If you need a production Docker Compose bundle (frontend + backend + ai + mongo + hardhat node), add it as next step.
