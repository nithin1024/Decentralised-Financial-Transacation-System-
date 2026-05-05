import { ethers } from 'ethers'

export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
      { indexed: true, internalType: 'address', name: 'receiver', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { indexed: false, internalType: 'bytes32', name: 'txHash', type: 'bytes32' },
    ],
    name: 'TransactionCreated',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'bytes32', name: 'txHash', type: 'bytes32' },
    ],
    name: 'sendTransaction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllTransactions',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'bytes32', name: 'txHash', type: 'bytes32' },
        ],
        internalType: 'struct FinancialTransactions.Transaction[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTransactionCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export const getEthereumProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is required. Please install the extension.')
  }
  return new ethers.BrowserProvider(window.ethereum)
}

export const getContract = async (withSigner = false) => {
  const provider = getEthereumProvider()
  const signer = withSigner ? await provider.getSigner() : null
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer || provider)
}
