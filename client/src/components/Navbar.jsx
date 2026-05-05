import React, { useContext, useState } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { Wallet, LogOut, Copy, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const { currentAccount, connectWallet, disconnectWallet } = useContext(TransactionContext);
  const [copied, setCopied] = useState(false);

  const shortenAddress = (address) => {
    return `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="w-full flex justify-between items-center p-4 sticky top-0 z-50 glass-card rounded-none border-t-0 border-x-0 !bg-slate-900/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center p-0.5">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Tx
            </span>
          </div>
        </div>
        <h1 className="text-xl font-semibold hidden sm:block tracking-wide">
          FinChain System
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {currentAccount ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-200">Sepolia</span>
            </div>
            
            <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
              <p className="text-sm font-medium text-indigo-300">
                {shortenAddress(currentAccount)}
              </p>
              <button onClick={copyToClipboard} className="text-indigo-400 hover:text-indigo-200 transition">
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <button
              onClick={disconnectWallet}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
              title="Disconnect Wallet"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
            className="flex items-center gap-2 btn-primary"
          >
            <Wallet size={18} />
            <span className="font-semibold">Connect Wallet</span>
          </motion.button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
