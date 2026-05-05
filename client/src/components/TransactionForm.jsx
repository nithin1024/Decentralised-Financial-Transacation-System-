import { Loader2, SendHorizontal } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import { useWeb3 } from '../hooks/useWeb3.js'

const TransactionForm = () => {
  const {
    account,
    isMetaMaskInstalled,
    estimateGasFee,
    requestTransactionConfirmation,
    isSending,
  } = useWeb3()
  const [receiver, setReceiver] = useState('')
  const [amountEth, setAmountEth] = useState('')
  const [estimatedGas, setEstimatedGas] = useState('')
  const [isEstimating, setIsEstimating] = useState(false)

  const validate = () => {
    if (!account) {
      toast.error('Connect wallet before sending.')
      return false
    }
    if (!ethers.isAddress(receiver)) {
      toast.error('Enter a valid receiver wallet address.')
      return false
    }
    const amount = Number(amountEth)
    if (!amount || amount <= 0) {
      toast.error('Amount must be greater than zero.')
      return false
    }
    return true
  }

  const handleEstimateGas = async () => {
    if (!validate()) return
    setIsEstimating(true)
    try {
      const fee = await estimateGasFee(receiver, amountEth)
      setEstimatedGas(fee)
      toast.success(`Estimated gas fee: ${fee} ETH`)
    } catch (error) {
      toast.error(error?.shortMessage || error?.message || 'Gas estimation failed.')
    } finally {
      setIsEstimating(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    requestTransactionConfirmation({
      receiver,
      amountEth,
      estimatedGas: estimatedGas || 'Not estimated',
    })
  }

  return (
    <section className="glass-card p-5 md:p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Send ETH Transaction
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Transfer ETH directly through your connected wallet.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
            Receiver Wallet Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            className="input-field"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value.trim())}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
            Amount (ETH)
          </label>
          <input
            type="number"
            min="0"
            step="0.0001"
            placeholder="0.01"
            className="input-field"
            value={amountEth}
            onChange={(e) => setAmountEth(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleEstimateGas}
            disabled={!isMetaMaskInstalled || isEstimating}
            className="rounded-2xl border border-indigo-300/60 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-500/35 dark:bg-indigo-500/15 dark:text-indigo-200"
          >
            {isEstimating ? 'Estimating...' : 'Estimate Gas'}
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Estimated Fee: <strong>{estimatedGas || '--'} ETH</strong>
          </span>
        </div>

        <button type="submit" disabled={isSending} className="primary-btn w-full">
          {isSending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <SendHorizontal size={16} className="mr-2" />
              Continue to Confirmation
            </>
          )}
        </button>
      </form>
    </section>
  )
}

export default TransactionForm
