class MetaMaskIntegration {
    static async connect() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                
                // Get Network ID
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                
                // Save to local state
                localStorage.setItem('mm_account', account);
                
                return { account, chainId };
            } catch (error) {
                console.error("MetaMask Connection Error:", error);
                throw new Error(error.message || "User denied account access or error occurred");
            }
        } else {
            throw new Error("MetaMask is not installed. Please install it and refresh the page.");
        }
    }

    static async initAccount() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    localStorage.setItem('mm_account', accounts[0]);
                } else {
                    localStorage.removeItem('mm_account');
                }
                
                window.ethereum.on('accountsChanged', (newAccounts) => {
                    if (newAccounts.length > 0) {
                        localStorage.setItem('mm_account', newAccounts[0]);
                        window.location.reload();
                    } else {
                        localStorage.removeItem('mm_account');
                        window.location.reload();
                    }
                });
            } catch(e) {
                console.error("Error fetching accounts", e);
            }
        }
    }

    static async getBalance(account) {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const balanceHex = await window.ethereum.request({ 
                    method: 'eth_getBalance', 
                    params: [account, 'latest'] 
                });
                return (parseInt(balanceHex, 16) / 1e18).toFixed(4);
            } catch(e) {
                console.error(e);
                return "0.0000";
            }
        }
        return "0.0000";
    }

    static async sendTransaction(to, amountEth) {
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if(accounts.length === 0) throw new Error("Wallet not connected");
            
            const amountWei = '0x' + (parseFloat(amountEth) * 1e18).toString(16);
            
            try {
                const txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: accounts[0],
                        to: to,
                        value: amountWei
                    }],
                });
                return txHash;
            } catch(e) {
                console.error("Tx Error", e);
                throw new Error(e.message || "Transaction failed");
            }
        } else {
            throw new Error("MetaMask is not installed.");
        }
    }

    static getAccount() {
        return localStorage.getItem('mm_account');
    }

    static disconnect() {
        localStorage.removeItem('mm_account');
    }
}

// Auto-initialize on load
document.addEventListener("DOMContentLoaded", () => {
    MetaMaskIntegration.initAccount();
});
