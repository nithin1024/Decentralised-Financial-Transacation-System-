import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Copy, ExternalLink, Archive } from "lucide-react";
import toast from "react-hot-toast";

const TransactionCard = ({ addressTo, addressFrom, timestamp, amount }) => {
  const { currentAccount } = useContext(TransactionContext);
  
  const isSender = currentAccount.toLowerCase() === addressFrom.toLowerCase();
  
  const shortenAddress = (address) => {
    return `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/10 transition-all duration-300 group cursor-default"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isSender ? 'bg-rose-500/20 text-rose-400 shadow-rose-500/20' : 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20'}`}>
          {isSender ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">
              {isSender ? "Sent to" : "Received from"}
            </span>
            <div 
              className="group/tooltip relative flex items-center gap-1 cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 px-2 py-0.5 rounded-md transition-colors"
              onClick={() => copyToClipboard(isSender ? addressTo : addressFrom)}
            >
              <span className="text-sm font-medium text-indigo-300">
                {shortenAddress(isSender ? addressTo : addressFrom)}
              </span>
              <Copy size={12} className="text-slate-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{timestamp}</p>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end">
        <h4 className={`font-bold tracking-tight bg-clip-text text-transparent ${isSender ? 'bg-gradient-to-r from-rose-400 to-rose-200' : 'bg-gradient-to-r from-emerald-400 to-emerald-200'}`}>
          {isSender ? "-" : "+"}{amount} {isSender ? "ETH" : "ETH"}
        </h4>
        <a 
          href={`https://sepolia.etherscan.io/address/${isSender ? addressTo : addressFrom}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-indigo-400/80 hover:text-indigo-300 flex items-center gap-1 mt-1 transition-colors"
        >
          View Address <ExternalLink size={10} />
        </a>
      </div>
    </motion.div>
  );
};

const Transactions = () => {
  const { currentAccount, transactions } = useContext(TransactionContext);

  if (!currentAccount) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card flex flex-col h-full overflow-hidden"
    >
      <div className="p-6 border-b border-white/10 bg-slate-800/40 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Archive size={20} className="text-indigo-400" />
          History
        </h3>
        <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
          {transactions.length} Total
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px] scroll-smooth">
        <AnimatePresence>
          {transactions.length > 0 ? (
            <div className="flex flex-col">
              {transactions.map((transaction, i) => (
                <TransactionCard key={i} {...transaction} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-slate-400"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                <Archive size={32} className="opacity-40" />
              </div>
              <p className="text-base font-medium text-slate-300">No transactions yet</p>
              <p className="text-sm mt-1 opacity-70">Your history will safely appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Transactions;
