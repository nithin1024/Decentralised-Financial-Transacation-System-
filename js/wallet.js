/**
 * Simulated Key Management System
 * Simulates Public/Private key pairs and digital signatures (Unit 1)
 */
class KeyManagementSystem {
    static register(pub, priv) {
        let keys = JSON.parse(localStorage.getItem('dfts_keys')) || {};
        keys[pub] = priv;
        localStorage.setItem('dfts_keys', JSON.stringify(keys));
    }
    
    static verify(pub, data, signature) {
        let keys = JSON.parse(localStorage.getItem('dfts_keys')) || {};
        let priv = keys[pub];
        if(!priv) return false;
        return signature === SHA256(priv + data);
    }
}

class KeyPair {
    constructor() {
        // Simple random generator for simulation purposes
        this.privateKey = 'priv_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
        this.publicKey = 'pub_' + SHA256(this.privateKey).substring(0, 40);
        KeyManagementSystem.register(this.publicKey, this.privateKey);
    }

    sign(dataHash) {
        return SHA256(this.privateKey + dataHash);
    }
}

class Wallet {
    static getCurrent() {
        const priv = localStorage.getItem('current_private_key');
        const pub = localStorage.getItem('current_public_key');
        if (priv && pub) {
            let key = new KeyPair();
            key.privateKey = priv;
            key.publicKey = pub;
            // Ensure it's registered
            KeyManagementSystem.register(pub, priv);
            return key;
        }
        return null;
    }

    static createNew() {
        const key = new KeyPair();
        localStorage.setItem('current_private_key', key.privateKey);
        localStorage.setItem('current_public_key', key.publicKey);
        return key;
    }

    static logout() {
        localStorage.removeItem('current_private_key');
        localStorage.removeItem('current_public_key');
    }
}
