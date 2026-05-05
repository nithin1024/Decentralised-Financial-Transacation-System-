class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        
        // Merkle Root calculation (Unit 1 & 3)
        const merkle = new MerkleTree(this.transactions);
        this.merkleRoot = merkle.getRoot();
        
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        // Hashing visualizes the block structure (Unit 1)
        // Note: SegWit separates signatures. We simulate that by using the merkle root of clean transactions.
        return CryptoUtils.hash(
            this.index + 
            this.previousHash + 
            this.timestamp + 
            this.merkleRoot + 
            this.nonce
        );
    }

    mineBlock(difficulty, onProgress) {
        // Proof-of-Work mining (Unit 1 & 3)
        let target = Array(difficulty + 1).join("0");
        let hashCount = 0;
        
        // Time mining simulation
        let startTime = Date.now();
        
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
            hashCount++;
            
            if (onProgress && hashCount % 10000 === 0) {
                onProgress(this.nonce, this.hash);
            }
        }
        
        let timeTaken = Date.now() - startTime;
        if(onProgress) onProgress(this.nonce, this.hash, timeTaken);
        console.log(`Block mined! Hash: ${this.hash} (Time: ${timeTaken}ms)`);
    }
}
