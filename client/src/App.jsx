import React, { useContext } from "react";
import { TransactionContext } from "./context/TransactionContext";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import SendTransaction from "./components/SendTransaction";
import Transactions from "./components/Transactions";
import NetworkWarning from "./components/NetworkWarning";
import ConfirmationModal from "./components/ConfirmationModal";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";

const App = () => {
  const { currentAccount, connectWallet } = useContext(TransactionContext);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="bg-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
      </div>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 relative z-10">
        {!currentAccount ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-12 max-w-xl flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
                <Wallet size={40} className="text-indigo-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">FinChain</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Connect your MetaMask wallet to send Ethereum securely, quickly, and flawlessly on the Sepolia Testnet.
              </p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={connectWallet} 
                className="btn-primary flex items-center gap-3 text-lg px-8 py-4"
              >
                <Wallet size={24} />
                Connect with MetaMask
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 w-full mt-4">
            <NetworkWarning />
            <Dashboard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full">
              <SendTransaction />
              <Transactions />
            </div>
          </div>
        )}
      </main>
      
      <ConfirmationModal />
      
      {currentAccount && (
        <footer className="w-full text-center py-6 text-slate-500 text-sm border-t border-white/5 backdrop-blur-md bg-slate-900/30 mt-auto relative z-10">
          <p>© 2026 FinChain System. Runs on Sepolia Testnet.</p>
        </footer>
      )}
    </div>
  );
};

export default App;
