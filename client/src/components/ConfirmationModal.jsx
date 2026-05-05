import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ExternalLink, X, Copy } from "lucide-react";
import toast from "react-hot-toast";

const ConfirmationModal = () => {
  const { successReceipt, closeReceiptModal } = useContext(TransactionContext);

  if (!successReceipt) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Hash copied!");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
        >
          <button 
            onClick={closeReceiptModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Transaction Successful</h2>
            <p className="text-slate-400 mb-8 max-w-sm">
              Your transaction has been securely minted and recorded on the Sepolia blockchain.
            </p>

            <div className="w-full bg-slate-800/50 rounded-xl p-4 mb-6 border border-white/5 text-left space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Amount Sent</p>
                <p className="text-lg font-bold text-white">{successReceipt.amount} ETH</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Sent To</p>
                <p className="text-sm font-medium text-slate-300 break-all">{successReceipt.addressTo}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center justify-between">
                  Transaction Hash
                  <button onClick={() => copyToClipboard(successReceipt.hash)} className="text-indigo-400 hover:text-indigo-300 cursor-pointer p-1">
                    <Copy size={12} />
                  </button>
                </p>
                <p className="text-xs font-mono text-indigo-300 break-all bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                  {successReceipt.hash}
                </p>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <a 
                href={`https://sepolia.etherscan.io/tx/${successReceipt.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                Etherscan <ExternalLink size={16} />
              </a>
              <button 
                onClick={closeReceiptModal}
                className="flex-1 btn-primary text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
