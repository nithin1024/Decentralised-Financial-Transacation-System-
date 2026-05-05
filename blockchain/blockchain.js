class CustomBlockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.difficulty = 3;
        this.miningReward = 100;
        // Simulating protocol upgrades (Unit 3 - BIPs)
        this.protocolVersion = "1.0.0";
    }

    createGenesisBlock() {
        return new Block(0, Date.parse("2026-01-01"), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress, onProgress) {
        // Mining reward
        const rewardTx = {
            from: "SYSTEM",
            to: miningRewardAddress,
            amount: this.miningReward,
            type: "Reward",
            timestamp: Date.now()
        };
        this.pendingTransactions.push(rewardTx);

        // Create new block
        let block = new Block(
            this.chain.length, 
            Date.now(), 
            this.pendingTransactions, 
            this.getLatestBlock().hash
        );
        
        block.mineBlock(this.difficulty, onProgress);
        this.chain.push(block);
        this.pendingTransactions = [];
        
        return block;
    }

    addTransaction(transaction) {
        // Double-spending prevention & Transaction validation
        if (!transaction.from || !transaction.to) {
            throw new Error('Transaction must include from and to address');
        }
        
        if(transaction.from !== "SYSTEM") {
            const balance = this.getBalanceOfAddress(transaction.from);
            if(balance < transaction.amount) {
                throw new Error(`Double-spending prevention: Not enough balance. Have ${balance}, need ${transaction.amount}`);
            }
            if(!transaction.signature) {
                throw new Error('Transaction must be signed');
            }
        }
        
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        // Calculate confirmed balance
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.from === address) balance -= trans.amount;
                if (trans.to === address) balance += trans.amount;
            }
        }
        // Deduct pending to prevent double spending
        for(const trans of this.pendingTransactions) {
            if(trans.from === address) balance -= trans.amount;
        }
        return balance;
    }

    isChainValid(chainToVerify = this.chain) {
        for (let i = 1; i < chainToVerify.length; i++) {
            const currentBlock = chainToVerify[i];
            const previousBlock = chainToVerify[i - 1];
            
            // Recalculate hash to detect tampering
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            // Check linkage
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
            // Validate Merkle root
            const merkle = new MerkleTree(currentBlock.transactions);
            if (currentBlock.merkleRoot !== merkle.getRoot()) {
                return false;
            }
        }
        return true;
    }

    resolveLongestChain(competingChains) {
        // Fork handling (Unit 3)
        let longest = this.chain;
        let replaced = false;

        for(let chain of competingChains) {
            if(chain.length > longest.length && this.isChainValid(chain)) {
                longest = chain;
                replaced = true;
            }
        }

        if(replaced) {
            this.chain = longest;
            console.log("Chain replaced with longest valid chain.");
        }
        return replaced;
    }
}
