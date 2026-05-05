/**
 * Transaction Simulator
 * Represents a single transaction in the network.
 */
class Transaction {
    constructor(fromAddress, toAddress, amount, type = "Standard", details = "") {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = parseFloat(amount);
        this.type = type; // e.g., 'Standard', 'SmartContract', 'SupplyChain'
        this.details = details;
        this.timestamp = Date.now();
        this.signature = '';
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.type + this.details + this.timestamp);
    }

    signTransaction(signingKey) {
        // You can only send a transaction from the wallet that is linked to your key
        if (signingKey.publicKey !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }
        const hashTx = this.calculateHash();
        this.signature = signingKey.sign(hashTx);
    }

    isValid() {
        // Mining reward transactions have no fromAddress
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        // Verify the signature using the KeyManagementSystem
        return KeyManagementSystem.verify(this.fromAddress, this.calculateHash(), this.signature);
    }
}

/**
 * Block Simulator
 */
class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.index = 0;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        // SegWit Concept (Unit 3): If we separate signatures from the transaction hash,
        // we map over transactions and only hash their pure data, not the signature.
        // For simplicity, we just stringify the transactions here.
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce);
    }

    mineBlock(difficulty, updateCallback = null) {
        let target = Array(difficulty + 1).join("0");
        let hashCount = 0;
        
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
            hashCount++;
            
            // For UI feedback during simulation
            if (updateCallback && hashCount % 5000 === 0) {
                updateCallback(this.nonce, this.hash);
            }
        }

        if (updateCallback) {
            updateCallback(this.nonce, this.hash);
        }
        
        console.log("Block mined: " + this.hash);
    }
}

/**
 * Blockchain Core System
 */
class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 3; // Adjustable difficulty for PoW (Unit 3)
        this.miningReward = 50;
        this.type = "Public"; // Public vs Private vs Consortium (Unit 1)
        
        this.createGenesisBlock();
    }

    createGenesisBlock() {
        const genesisBlock = new Block(Date.now(), [], "0");
        genesisBlock.index = 0;
        this.chain.push(genesisBlock);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress, updateCallback = null) {
        // Create a reward transaction
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, "Reward", "Mining Reward");
        this.pendingTransactions.push(rewardTx);

        // In real blockchains, you don't add all pending transactions, you select them based on fees.
        // For this simulation, we add them all.
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.index = this.chain.length;
        
        block.mineBlock(this.difficulty, updateCallback);

        console.log('Block successfully mined!');
        this.chain.push(block);

        // Reset pending transactions
        this.pendingTransactions = [];
        
        this.saveToStorage();
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }
        
        // Prevent negative balances (Double spending prevention - Unit 2)
        if(transaction.fromAddress !== null) {
            const balance = this.getBalanceOfAddress(transaction.fromAddress);
            if(balance < transaction.amount) {
                 throw new Error('Not enough balance!');
            }
        }

        this.pendingTransactions.push(transaction);
        this.saveToStorage();
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        
        // Calculate pending transactions that deduct balance to prevent double spending
        for (const trans of this.pendingTransactions) {
            if (trans.fromAddress === address) {
                balance -= trans.amount;
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Re-calculate block hash and check if it matches
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Check if current block points to correct previous block
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            // Verify all transactions in the block
            for (const tx of currentBlock.transactions) {
                if (!tx.isValid()) {
                    return false;
                }
            }
        }
        return true;
    }

    // Forking simulation (Unit 3)
    resolveConflicts(alternateChain) {
        if (alternateChain.length > this.chain.length && this.isChainValid(alternateChain)) {
            this.chain = alternateChain;
            this.saveToStorage();
            return true; // Chain was replaced
        }
        return false;
    }
    
    saveToStorage() {
        localStorage.setItem('dfts_blockchain', JSON.stringify(this.chain));
        localStorage.setItem('dfts_pending_tx', JSON.stringify(this.pendingTransactions));
        localStorage.setItem('dfts_difficulty', this.difficulty);
    }
    
    loadFromStorage() {
        const storedChain = localStorage.getItem('dfts_blockchain');
        if (storedChain) {
            const parsedChain = JSON.parse(storedChain);
            // Reconstruct Block objects
            this.chain = parsedChain.map(b => {
                let block = new Block(b.timestamp, b.transactions, b.previousHash);
                block.index = b.index;
                block.hash = b.hash;
                block.nonce = b.nonce;
                
                // Reconstruct transactions
                block.transactions = block.transactions.map(t => {
                    let tx = new Transaction(t.fromAddress, t.toAddress, t.amount, t.type, t.details);
                    tx.timestamp = t.timestamp;
                    tx.signature = t.signature;
                    return tx;
                });
                
                return block;
            });
        }
        
        const storedPending = localStorage.getItem('dfts_pending_tx');
        if (storedPending) {
            const parsedPending = JSON.parse(storedPending);
            this.pendingTransactions = parsedPending.map(t => {
                let tx = new Transaction(t.fromAddress, t.toAddress, t.amount, t.type, t.details);
                tx.timestamp = t.timestamp;
                tx.signature = t.signature;
                return tx;
            });
        }
        
        const storedDiff = localStorage.getItem('dfts_difficulty');
        if(storedDiff) this.difficulty = parseInt(storedDiff);
    }
}
