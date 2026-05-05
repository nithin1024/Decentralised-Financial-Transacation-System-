const BASE_URL = window.location.pathname.includes('/frontend/pages/') ? '../../' : './';

function injectNavbar() {
    const isPage = (name) => {
        const path = location.pathname;
        if(name === 'index' && (path.endsWith('index.html') || path.endsWith('/'))) return 'active';
        return path.includes(name) ? 'active' : '';
    };

    const navHTML = `
    <nav>
        <div class="logo">
            <span>⬡</span> HDFE Ecosystem
        </div>
        <div class="nav-links">
            <a href="${BASE_URL}index.html" class="${isPage('index')}">Dashboard</a>
            <a href="${BASE_URL}frontend/pages/wallet.html" class="${isPage('wallet')}">Wallet (Web3)</a>
            <a href="${BASE_URL}frontend/pages/transaction.html" class="${isPage('transaction')}">Transfer</a>
            <a href="${BASE_URL}frontend/pages/blockchain.html" class="${isPage('blockchain')}">Explorer</a>
            <a href="${BASE_URL}frontend/pages/mining.html" class="${isPage('mining')}">Mining</a>
            <a href="${BASE_URL}frontend/pages/contracts.html" class="${isPage('contracts')}">Contracts</a>
            <a href="${BASE_URL}frontend/pages/applications.html" class="${isPage('applications')}">DApps</a>
            <a href="${BASE_URL}frontend/pages/analytics.html" class="${isPage('analytics')}">Analytics</a>
        </div>
    </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// Common UI Scripts
function showToast(msg, type='success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", injectNavbar);
