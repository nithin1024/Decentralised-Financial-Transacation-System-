import { Activity, Landmark, ShieldCheck } from 'lucide-react'
import { useWeb3 } from '../hooks/useWeb3.js'

const DashboardCards = () => {
  const { balance, transactions, chainId, account } = useWeb3()

  const cards = [
    {
      title: 'Wallet Balance',
      value: `${balance} ETH`,
      icon: <Landmark className="text-indigo-600 dark:text-indigo-300" />,
    },
    {
      title: 'Total Transactions',
      value: String(transactions.length),
      icon: <Activity className="text-blue-600 dark:text-blue-300" />,
    },
    {
      title: 'Connection Status',
      value: account ? `Connected (Chain ${chainId || '-'})` : 'Not Connected',
      icon: <ShieldCheck className="text-purple-600 dark:text-purple-300" />,
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className="glass-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">{card.title}</p>
            {card.icon}
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  )
}

export default DashboardCards
