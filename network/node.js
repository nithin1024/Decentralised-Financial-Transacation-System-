// Layer 2: Network & P2P Simulation
// Simulates multiple nodes, synchronization, and broadcasting.

class NetworkNode {
    constructor(nodeId) {
        this.nodeId = nodeId;
        this.blockchain = new CustomBlockchain();
        this.peers = []; // Other NetworkNodes
    }

    connectPeer(node) {
        if(!this.peers.includes(node)) {
            this.peers.push(node);
            node.peers.push(this);
            console.log(`[P2P] Node ${this.nodeId} connected to Node ${node.nodeId}`);
        }
    }

    broadcastTransaction(tx) {
        console.log(`[P2P - ${this.nodeId}] Broadcasting transaction...`);
        this.peers.forEach(peer => {
            try {
                // Ensure peer doesn't have it already
                const exists = peer.blockchain.pendingTransactions.find(t => t.signature === tx.signature);
                if(!exists) {
                    peer.receiveTransaction(tx);
                }
            } catch(e) {}
        });
    }

    receiveTransaction(tx) {
        try {
            this.blockchain.addTransaction(tx);
            console.log(`[P2P - ${this.nodeId}] Received and validated transaction.`);
            // Gossip protocol
            this.broadcastTransaction(tx);
        } catch(e) {
            console.error(`[P2P - ${this.nodeId}] Rejected transaction:`, e.message);
        }
    }

    broadcastBlock(block) {
        console.log(`[P2P - ${this.nodeId}] Broadcasting new block ${block.index}...`);
        this.peers.forEach(peer => {
            peer.receiveBlock(block);
        });
    }

    receiveBlock(block) {
        // If the block is the next one, append. If it causes a fork, resolve.
        const latest = this.blockchain.getLatestBlock();
        if(block.previousHash === latest.hash) {
            this.blockchain.chain.push(block);
            // Clear confirmed pending txs
            this.blockchain.pendingTransactions = this.blockchain.pendingTransactions.filter(pt => 
                !block.transactions.find(t => t.signature === pt.signature)
            );
            console.log(`[P2P - ${this.nodeId}] Block ${block.index} accepted.`);
        } else if (block.index > latest.index) {
            // Need to sync chains
            console.log(`[P2P - ${this.nodeId}] Chain out of sync. Requesting full chain...`);
            this.syncChain();
        }
    }

    syncChain() {
        let allChains = this.peers.map(p => p.blockchain.chain);
        this.blockchain.resolveLongestChain(allChains);
    }
}

// Initialize Global Network for the Application
class NetworkSimulator {
    static init() {
        if(window.HDFENetwork) return window.HDFENetwork;
        
        // Create 3 nodes
        const nodeA = new NetworkNode("A_Main");
        const nodeB = new NetworkNode("B_Validator");
        const nodeC = new NetworkNode("C_Backup");

        nodeA.connectPeer(nodeB);
        nodeB.connectPeer(nodeC);

        window.HDFENetwork = {
            nodes: [nodeA, nodeB, nodeC],
            mainNode: nodeA,
            // Helper to persist state to local storage for offline use
            save: () => {
                localStorage.setItem("hdfe_chains", JSON.stringify(window.HDFENetwork.nodes.map(n => n.blockchain)));
            },
            load: () => {
                let data = localStorage.getItem("hdfe_chains");
                if(data) {
                    let chains = JSON.parse(data);
                    window.HDFENetwork.nodes.forEach((n, idx) => {
                        Object.assign(n.blockchain, chains[idx]);
                    });
                }
            }
        };
        window.HDFENetwork.load();
        return window.HDFENetwork;
    }
}
