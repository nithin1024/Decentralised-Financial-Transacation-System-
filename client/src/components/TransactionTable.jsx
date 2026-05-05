import { ExternalLink } from 'lucide-react'
import { useWeb3 } from '../hooks/useWeb3.js'
import { formatDate, formatEth, shortenAddress } from '../lib/utils.js'

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="px-3 py-3">
        <div className="h-4 rounded bg-slate-200/70 dark:bg-slate-700/70" />
      </td>
    ))}
  </tr>
)

const TransactionTable = () => {
  const { transactions, isLoadingTransactions } = useWeb3()

  return (
    <section className="glass-card p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          On-Chain Transaction History
        </h3>
        <span className="rounded-xl bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
          {transactions.length} records
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100/70 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            <tr>
              <th className="px-3 py-2.5">Sender</th>
              <th className="px-3 py-2.5">Receiver</th>
              <th className="px-3 py-2.5">Amount</th>
              <th className="px-3 py-2.5">Timestamp</th>
              <th className="px-3 py-2.5">Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
            {isLoadingTransactions && (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}

            {!isLoadingTransactions && transactions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No transactions recorded yet. Send your first transaction.
                </td>
              </tr>
            )}

            {!isLoadingTransactions &&
              transactions.map((tx) => (
                <tr key={tx.id} className="text-slate-700 dark:text-slate-200">
                  <td className="px-3 py-3">{shortenAddress(tx.sender)}</td>
                  <td className="px-3 py-3">{shortenAddress(tx.receiver)}</td>
                  <td className="px-3 py-3">{formatEth(tx.amount)} ETH</td>
                  <td className="px-3 py-3">{formatDate(tx.timestamp)}</td>
                  <td className="px-3 py-3">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-300"
                    >
                      View
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default TransactionTable
