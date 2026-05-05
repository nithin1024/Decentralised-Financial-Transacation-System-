import React, { useEffect, useState, createContext } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
import toast from "react-hot-toast";

export const TransactionContext = createContext();

const { ethereum } = window;

const getEthereumContract = async () => {
  if (!ethereum) return null;
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({ addressTo: "", amount: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState("0");
  const [isSepolia, setIsSepolia] = useState(true);
  
  // For confirmation modal
  const [successReceipt, setSuccessReceipt] = useState(null);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        await checkNetwork();
        getAllTransactions();
        updateBalance(accounts[0]);
      }
    } catch (error) {
      console.error("No ethereum object.", error);
    }
  };

  const checkNetwork = async () => {
    if (!ethereum) return false;
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      const currentIsSepolia = chainId === '0xaa36a7';
      setIsSepolia(currentIsSepolia);
      return currentIsSepolia;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const switchNetwork = async () => {
    try {
      if (!ethereum) return toast.error("MetaMask not found!");
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia Hex
      });
      setIsSepolia(true);
      toast.success("Successfully switched to Sepolia!");
    } catch (error) {
      console.error(error);
      if (error.code === 4902) {
        toast.error("Sepolia network is not available in your MetaMask.");
      } else {
        toast.error("Failed to switch network.");
      }
    }
  };

  const updateBalance = async (account) => {
    try {
      if (!ethereum) return;
      const provider = new ethers.BrowserProvider(ethereum);
      const userBalance = await provider.getBalance(account);
      setBalance(ethers.formatEther(userBalance));
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return toast.error("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      toast.success("Wallet connected!");
      
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        toast.error("Please switch to Sepolia network.");
      }
      
      getAllTransactions();
      updateBalance(accounts[0]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect wallet.");
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount("");
    setTransactions([]);
    setBalance("0");
    setSuccessReceipt(null);
    toast.success("Wallet disconnected.", { icon: '🚪' });
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return;
      const transactionsContract = await getEthereumContract();
      if (!transactionsContract) return;

      const availableTransactions = await transactionsContract.getAllTransactions();
      
      const structuredTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(Number(transaction.timestamp) * 1000).toLocaleString(),
        amount: ethers.formatEther(transaction.amount)
      }));

      setTransactions(structuredTransactions.reverse());
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return toast.error("Please install MetaMask.");
      const isCorrectNetwork = await checkNetwork();
      
      if (!isCorrectNetwork) {
        return toast.error("Must be on Sepolia to send transactions.");
      }
      
      const { addressTo, amount } = formData;
      if (!addressTo || !amount) return toast.error("Please fill in all fields.");

      if (!ethers.isAddress(addressTo)) {
        return toast.error("Invalid Ethereum Address.");
      }

      if (parseFloat(amount) > parseFloat(balance)) {
        return toast.error("Insufficient funds for transaction.");
      }

      const transactionsContract = await getEthereumContract();
      if (!transactionsContract) return;

      const parsedAmount = ethers.parseEther(amount);

      setIsLoading(true);
      const transactionHash = await transactionsContract.sendTransaction(addressTo, {
        value: parsedAmount
      });
      
      toast.loading(`Waiting for confirmation...`, { id: 'tx-loading' });

      const receipt = await transactionHash.wait();
      
      setIsLoading(false);
      toast.dismiss('tx-loading');
      toast.success(`Transaction successful!`);
      
      setSuccessReceipt({
        amount: formData.amount,
        addressTo: formData.addressTo,
        hash: receipt.hash
      });

      setFormData({ addressTo: "", amount: "" });
      updateBalance(currentAccount);
      getAllTransactions();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.dismiss('tx-loading');
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error("Transaction rejected by user.");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.error("Insufficient funds for gas limits.");
      } else if (error.message && error.message.includes("UNCONFIGURED_NAME")) {
         toast.error("System configuration error: Invalid deployed contract address.");
      } else {
        toast.error("Transaction failed or threw an error.");
      }
    }
  };

  const closeReceiptModal = () => {
    setSuccessReceipt(null);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    
    if (ethereum) {
      ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          updateBalance(accounts[0]);
          getAllTransactions();
          toast.success("Wallet account switched");
        } else {
          disconnectWallet();
        }
      });
      
      ethereum.on('chainChanged', (chainId) => {
        const correctChain = chainId === '0xaa36a7';
        setIsSepolia(correctChain);
        if (!correctChain) {
          toast.error("Network changed. Please switch back to Sepolia.", { duration: 4000 });
        } else {
          toast.success("Connected to Sepolia Network");
          updateBalance(currentAccount);
          getAllTransactions();
        }
      });
    }

    return () => {
      if (ethereum) {
        ethereum.removeAllListeners('accountsChanged');
        ethereum.removeAllListeners('chainChanged');
      }
    }
  }, [currentAccount]);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
        balance,
        updateBalance,
        isSepolia,
        switchNetwork,
        successReceipt,
        closeReceiptModal
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
