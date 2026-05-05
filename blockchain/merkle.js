class MerkleTree {
    constructor(transactions) {
        this.transactions = transactions;
        this.leaves = transactions.map(tx => CryptoUtils.hash(JSON.stringify(tx)));
        this.root = this.buildTree(this.leaves);
    }

    buildTree(leaves) {
        if (leaves.length === 0) return CryptoUtils.hash('');
        if (leaves.length === 1) return leaves[0];
        
        let newLevel = [];
        for (let i = 0; i < leaves.length; i += 2) {
            let left = leaves[i];
            let right = (i + 1 < leaves.length) ? leaves[i + 1] : left; // Duplicate if odd
            newLevel.push(CryptoUtils.hash(left + right));
        }
        
        return this.buildTree(newLevel);
    }

    getRoot() {
        return this.root;
    }
}
