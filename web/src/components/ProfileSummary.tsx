import type { Profile } from '@/types/database'

import { AnimatedNumber } from './ui/animated-number'

interface ProfileSummaryProps {
  profile: Profile | null
  loading: boolean
}

export function ProfileSummary({ profile, loading }: ProfileSummaryProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className="mb-1 text-xs text-gray-500">Available Cash</div>
            <div className="text-lg font-bold text-gray-300">$ 0</div>
            <div className="text-xs text-gray-400">Loading...</div>
          </div>
          <div className="flex flex-col">
            <div className="mb-1 text-xs text-gray-500">Portfolio Value</div>
            <div className="text-lg font-bold text-gray-300">$ 0</div>
            <div className="text-xs text-gray-400">Loading...</div>
          </div>
          <div className="flex flex-col">
            <div className="mb-1 text-xs text-gray-500">Net P&L</div>
            <div className="text-lg font-bold text-gray-300">$ 0</div>
            <div className="text-xs text-gray-400">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  const netProfit = profile?.net_profit || 0
  const isPositive = netProfit >= 0

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="grid grid-cols-3 gap-4">
        {/* Cash Card */}
        <div className="flex flex-col">
          <div className="mb-1 text-xs text-gray-500">Available Cash</div>
          <AnimatedNumber
            value={profile?.balance || 0}
            className="text-lg font-bold text-gray-900"
            prefix="$ "
          />
          <div className="text-xs text-gray-400">Ready for investment</div>
        </div>

        {/* Holdings Value Card */}
        <div className="flex flex-col">
          <div className="mb-1 text-xs text-gray-500">Portfolio Value</div>
          <AnimatedNumber
            value={profile?.holdings || 0}
            className="text-lg font-bold text-gray-900"
            prefix="$ "
          />
          <div className="text-xs text-gray-400">Current holdings total</div>
        </div>

        {/* Net P&L Card */}
        <div className="flex flex-col">
          <div className="mb-1 text-xs text-gray-500">Net P&L</div>
          <AnimatedNumber
            value={Math.abs(netProfit)}
            className={`text-lg font-bold text-gray-900`}
            prefix={isPositive ? '+$ ' : '-$ '}
          />
          <div className="text-xs text-gray-400">
            {isPositive ? 'Profitable' : 'Loss'} this period
          </div>
        </div>
      </div>
    </div>
  )
}
