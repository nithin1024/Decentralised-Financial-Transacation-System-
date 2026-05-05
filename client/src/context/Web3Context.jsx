import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { CONTRACT_ADDRESS, getContract, getEthereumProvider } from '../lib/contract.js'

const Web3Context = createContext(null)

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0.0000')
  const [chainId, setChainId] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [pendingTransaction, setPendingTransaction] = useState(null)

  const isMetaMaskInstalled = Boolean(window.ethereum)

  const loadAccountState = useCallback(async (selectedAccount) => {
    if (!selectedAccount) return
    const provider = getEthereumProvider()
    const network = await provider.getNetwork()
    const balanceWei = await provider.getBalance(selectedAccount)
    setChainId(network.chainId.toString())
    setBalance(Number(ethers.formatEther(balanceWei)).toFixed(4))
  }, [])

  const loadTransactions = useCallback(async () => {
    if (!isMetaMaskInstalled || CONTRACT_ADDRESS.startsWith('0x0000')) return
    setIsLoadingTransactions(true)
    try {
      const contract = await getContract()
      const records = await contract.getAllTransactions()
      const normalized = [...records]
        .map((tx, index) => ({
          id: `${tx.txHash}-${index}`,
          sender: tx.sender,
          receiver: tx.receiver,
          amount: tx.amount,
          timestamp: tx.timestamp,
          txHash: tx.txHash,
        }))
        .reverse()
      setTransactions(normalized)
    } catch (error) {
      toast.error(error?.reason || 'Failed to fetch transaction history.')
    } finally {
      setIsLoadingTransactions(false)
    }
  }, [isMetaMaskInstalled])

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      toast.error('MetaMask not found.')
      return
    }
    setIsConnecting(true)
    try {
      const provider = getEthereumProvider()
      const accounts = await provider.send('eth_requestAccounts', [])
      if (accounts.length > 0) {
        setAccount(accounts[0])
        await loadAccountState(accounts[0])
        await loadTransactions()
        toast.success('Wallet connected successfully.')
      }
    } catch (error) {
      toast.error(error?.message || 'Wallet connection failed.')
    } finally {
      setIsConnecting(false)
    }
  }, [isMetaMaskInstalled, loadAccountState, loadTransactions])

  const estimateGasFee = useCallback(async (receiver, amountEth) => {
    const provider = getEthereumProvider()
    const signer = await provider.getSigner()
    const value = ethers.parseEther(amountEth)
    const pseudoHash = ethers.keccak256(ethers.toUtf8Bytes(`${Date.now()}-${receiver}`))
    const txReq = await signer.populateTransaction({
      to: CONTRACT_ADDRESS,
      data: (await getContract(true)).interface.encodeFunctionData('sendTransaction', [
        receiver,
        pseudoHash,
      ]),
      value,
    })
    const estimated = await provider.estimateGas(txReq)
    const feeData = await provider.getFeeData()
    const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice || 0n
    const totalFee = estimated * maxFeePerGas
    return Number(ethers.formatEther(totalFee)).toFixed(6)
  }, [])

  const requestTransactionConfirmation = useCallback((payload) => {
    setPendingTransaction(payload)
  }, [])

  const closeConfirmationModal = useCallback(() => {
    if (isSending) return
    setPendingTransaction(null)
  }, [isSending])

  const confirmAndSendTransaction = useCallback(async () => {
    if (!pendingTransaction) return
    setIsSending(true)
    try {
      const { receiver, amountEth } = pendingTransaction
      const contract = await getContract(true)
      const amountWei = ethers.parseEther(amountEth)
      const txHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${Date.now()}-${account}-${receiver}-${amountEth}`),
      )
      const tx = await contract.sendTransaction(receiver, txHash, {
        value: amountWei,
      })
      await tx.wait()
      await loadAccountState(account)
      await loadTransactions()
      setPendingTransaction(null)
      toast.success('Transaction completed successfully.')
    } catch (error) {
      toast.error(error?.shortMessage || error?.reason || 'Transaction failed.')
    } finally {
      setIsSending(false)
    }
  }, [account, loadAccountState, loadTransactions, pendingTransaction])

  useEffect(() => {
    if (!isMetaMaskInstalled) return
    const init = async () => {
      const provider = getEthereumProvider()
      const accounts = await provider.send('eth_accounts', [])
      if (accounts.length > 0) {
        setAccount(accounts[0])
        await loadAccountState(accounts[0])
        await loadTransactions()
      }
    }
    init()
  }, [isMetaMaskInstalled, loadAccountState, loadTransactions])

  useEffect(() => {
    if (!window.ethereum) return
    const handleAccountsChanged = async (accounts) => {
      const next = accounts?.[0] || ''
      setAccount(next)
      if (next) {
        await loadAccountState(next)
        await loadTransactions()
      } else {
        setBalance('0.0000')
      }
    }
    const handleChainChanged = () => window.location.reload()
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [loadAccountState, loadTransactions])

  useEffect(() => {
    if (!isMetaMaskInstalled || CONTRACT_ADDRESS.startsWith('0x0000')) return
    let contractRef
    const bindListener = async () => {
      contractRef = await getContract()
      contractRef.on('TransactionCreated', async () => {
        await loadTransactions()
      })
    }
    bindListener()
    return () => {
      if (contractRef) {
        contractRef.removeAllListeners('TransactionCreated')
      }
    }
  }, [isMetaMaskInstalled, loadTransactions])

  const value = useMemo(
    () => ({
      account,
      balance,
      chainId,
      transactions,
      pendingTransaction,
      isConnecting,
      isSending,
      isLoadingTransactions,
      isMetaMaskInstalled,
      connectWallet,
      loadTransactions,
      estimateGasFee,
      requestTransactionConfirmation,
      confirmAndSendTransaction,
      closeConfirmationModal,
    }),
    [
      account,
      balance,
      chainId,
      transactions,
      pendingTransaction,
      isConnecting,
      isSending,
      isLoadingTransactions,
      isMetaMaskInstalled,
      connectWallet,
      loadTransactions,
      estimateGasFee,
      requestTransactionConfirmation,
      confirmAndSendTransaction,
      closeConfirmationModal,
    ],
  )

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export { Web3Context }
