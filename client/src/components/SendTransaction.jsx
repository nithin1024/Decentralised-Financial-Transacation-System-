import React, { useContext, useEffect, useState } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, AlertCircle } from "lucide-react";

const SendTransaction = () => {
  const { currentAccount, formData, sendTransaction, handleChange, isLoading, balance, isSepolia } = useContext(TransactionContext);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    validateInputs();
  }, [formData, balance]);

  const validateInputs = () => {
    const newErrors = {};
    const { addressTo, amount } = formData;

    if (addressTo && !ethers.isAddress(addressTo)) {
      newErrors.addressTo = "Invalid Ethereum address format.";
    }

    if (amount) {
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        newErrors.amount = "Amount must be greater than 0.";
      } else if (parseFloat(amount) > parseFloat(balance)) {
        newErrors.amount = "Insufficient balance.";
      }
    }

    setErrors(newErrors);
  };

  const isFormValid = formData.addressTo && formData.amount && Object.keys(errors).length === 0 && isSepolia;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      sendTransaction();
    }
  };

  if (!currentAccount) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-8 flex flex-col justify-between w-full h-full relative"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">Send ETH</h2>
        <p className="text-slate-400 text-sm">Execute a secure smart contract transaction on the Sepolia network.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-8 flex-1">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300 ml-1">Receiver Address</label>
          <div className="relative">
            <input
              placeholder="0x..."
              name="addressTo"
              type="text"
              value={formData.addressTo}
              onChange={(e) => handleChange(e, "addressTo")}
              disabled={isLoading || !isSepolia}
              className={`input-field ${errors.addressTo ? 'border-red-500/50 focus:ring-red-500' : ''} disabled:opacity-50`}
            />
          </div>
          <AnimatePresence>
            {errors.addressTo && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs mt-1 ml-1 flex items-center gap-1"
              >
                <AlertCircle size={12} /> {errors.addressTo}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300 ml-1">Amount (ETH)</label>
          <div className="relative">
            <input
              placeholder="0.01"
              name="amount"
              type="number"
              step="0.0001"
              value={formData.amount}
              onChange={(e) => handleChange(e, "amount")}
              disabled={isLoading || !isSepolia}
              className={`input-field ${errors.amount ? 'border-red-500/50 focus:ring-red-500' : ''} disabled:opacity-50`}
            />
            <button 
              type="button"
              onClick={() => handleChange({ target: { value: (parseFloat(balance) * 0.99).toFixed(4).toString() } }, "amount")}
              className="absolute right-3 top-3 text-xs font-bold text-indigo-400 hover:text-indigo-300"
              disabled={isLoading || !isSepolia}
            >
              MAX
            </button>
          </div>
          <AnimatePresence>
            {errors.amount && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs mt-1 ml-1 flex items-center gap-1"
              >
                <AlertCircle size={12} /> {errors.amount}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={!isFormValid || isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 mt-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing Transaction...
          </>
        ) : (
          <>
            <Send size={20} />
            Transfer Now
          </>
        )}
      </button>
    </motion.div>
  );
};

export default SendTransaction;
