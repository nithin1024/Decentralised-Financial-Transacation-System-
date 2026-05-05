import React, { useContext, useState } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { motion } from "framer-motion";
import { ArrowUpRight, Activity, Wallet, RefreshCw } from "lucide-react";

const Dashboard = () => {
  const { currentAccount, balance, transactions, updateBalance } = useContext(TransactionContext);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!currentAccount) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await updateBalance(currentAccount);
    setTimeout(() => setIsRefreshing(false), 800); // UI feel
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2"
    >
      <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all"></div>
        <div className="flex items-center justify-between z-10 w-full mb-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Wallet size={20} className="text-indigo-400" />
            <h3 className="font-medium">Total Balance</h3>
          </div>
          <button 
            onClick={handleRefresh} 
            className="text-slate-500 hover:text-indigo-400 transition-colors"
            title="Refresh Balance"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="z-10">
          <h2 className="text-4xl font-bold tracking-tight text-white mb-1 drop-shadow-md">
            {parseFloat(balance).toFixed(4)} <span className="text-xl text-indigo-300 font-medium tracking-normal">ETH</span>
          </h2>
        </div>
      </div>

      <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-all"></div>
        <div className="flex items-center gap-3 text-slate-400 mb-4 z-10">
          <Activity size={20} className="text-purple-400" />
          <h3 className="font-medium">Total Transactions</h3>
        </div>
        <div className="z-10">
          <h2 className="text-4xl font-bold tracking-tight text-white mb-1 drop-shadow-md">
            {transactions.length} <span className="text-xl text-purple-300 font-medium tracking-normal">TXNs</span>
          </h2>
        </div>
      </div>

      <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/20 rounded-full blur-xl group-hover:bg-rose-500/30 transition-all"></div>
        <div className="flex items-center gap-3 text-slate-400 mb-4 z-10">
          <ArrowUpRight size={20} className="text-rose-400" />
          <h3 className="font-medium">Total Volume</h3>
        </div>
        <div className="z-10">
          <h2 className="text-4xl font-bold tracking-tight text-white mb-1 drop-shadow-md">
            {transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(4)} <span className="text-xl text-rose-300 font-medium tracking-normal">ETH</span>
          </h2>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
