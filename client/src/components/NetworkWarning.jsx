import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { AlertTriangle, Power } from "lucide-react";
import { motion } from "framer-motion";

const NetworkWarning = () => {
  const { currentAccount, isSepolia, switchNetwork } = useContext(TransactionContext);

  if (!currentAccount || isSepolia) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md"
    >
      <div className="flex items-center gap-3 text-amber-200">
        <AlertTriangle size={24} className="text-amber-400" />
        <div>
          <h4 className="font-bold">Incorrect Network Detected</h4>
          <p className="text-sm opacity-90">Please switch to the Sepolia network to use this DApp.</p>
        </div>
      </div>
      <button 
        onClick={switchNetwork}
        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
      >
        <Power size={18} />
        Switch Network
      </button>
    </motion.div>
  );
};

export default NetworkWarning;
