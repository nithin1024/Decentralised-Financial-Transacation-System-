// ABIs for offline deployment & interaction
const CONTRACT_ABIS = {
    Escrow: [
        "function deposit() external payable",
        "function releaseFunds() external",
        "function refund() external",
        "function amount() view returns (uint256)",
        "function currentState() view returns (uint8)"
    ],
    Loan: [
        "function requestLoan(uint256 _amount, uint256 _interestRate, uint256 _durationSeconds) external",
        "function approveLoan(uint256 _loanId) external payable",
        "function repayLoan(uint256 _loanId) external payable",
        "function loans(uint256) view returns (address borrower, uint256 amount, uint256 interestRate, uint256 dueDate, bool approved, bool repaid, address lender)"
    ],
    Token: [
        "function transfer(address _to, uint256 _value) external returns (bool)",
        "function mint(address _to, uint256 _amount) external",
        "function balanceOf(address) view returns (uint256)"
    ]
};

// Assuming Ganache local RPC or using Ethers Web3Provider via MetaMask
class ContractManager {
    static getProvider() {
        if(typeof window.ethereum !== 'undefined') {
            return new ethers.providers.Web3Provider(window.ethereum);
        }
        // Fallback to local Ganache if no Metamask (offline default port 8545 or 7545)
        return new ethers.providers.JsonRpcProvider("http://localhost:7545");
    }

    static async getEscrowContract(address) {
        const provider = this.getProvider();
        const signer = provider.getSigner();
        return new ethers.Contract(address, CONTRACT_ABIS.Escrow, signer);
    }

    static async getLoanContract(address) {
        const provider = this.getProvider();
        const signer = provider.getSigner();
        return new ethers.Contract(address, CONTRACT_ABIS.Loan, signer);
    }
    
    static async getTokenContract(address) {
        const provider = this.getProvider();
        const signer = provider.getSigner();
        return new ethers.Contract(address, CONTRACT_ABIS.Token, signer);
    }
}
