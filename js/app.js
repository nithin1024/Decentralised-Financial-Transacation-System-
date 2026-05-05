// Initialize Global Blockchain State
const DFTS = new Blockchain();
DFTS.loadFromStorage();

// Shared UI Utilities
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Create Shared Navigation
document.addEventListener("DOMContentLoaded", () => {
    if(document.body.dataset.nonav) return;

    const isPage = (name) => {
        const path = location.pathname;
        if(name === 'index' && (path.endsWith('index.html') || path.endsWith('/'))) return 'active';
        return path.includes(name) ? 'active' : '';
    };

    const navHTML = `
    <nav>
        <div class="logo">
            <span>⬡</span> DFTS
        </div>
        <div class="nav-links">
            <a href="index.html" class="${isPage('index')}">Dashboard</a>
            <a href="create-transaction.html" class="${isPage('create-transaction')}">Transfer</a>
            <a href="blockchain-view.html" class="${isPage('blockchain-view')}">Explorer</a>
            <a href="mining.html" class="${isPage('mining')}">Mining</a>
            <a href="applications.html" class="${isPage('applications')}">DApps</a>
            <a href="wallet.html" class="${isPage('wallet')}" id="nav-wallet">Wallet</a>
        </div>
    </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    
    updateNavWallet();
});

function updateNavWallet() {
    const wallet = Wallet.getCurrent();
    const navW = document.getElementById('nav-wallet');
    if(wallet && navW) {
        const balance = DFTS.getBalanceOfAddress(wallet.publicKey);
        navW.innerHTML = `Wallet (<span style="color:var(--accent)">$${balance}</span>)`;
    }
}
