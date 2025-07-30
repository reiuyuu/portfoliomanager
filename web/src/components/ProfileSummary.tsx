import type { Profile } from '@/types/database'

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
            <div className="mb-1 text-xs text-gray-400">Available Cash</div>
            <div className="text-xl font-bold text-gray-300">$ 0</div>
            <div className="text-xs text-gray-400">Loading...</div>
          </div>
          <div className="flex flex-col">
            <div className="mb-1 text-xs text-gray-400">Portfolio Value</div>
            <div className="text-xl font-bold text-gray-300">$ 0</div>
            <div className="text-xs text-gray-400">Loading...</div>
          </div>
          <div className="flex flex-col">
            <div className="mb-1 text-xs text-gray-400">Net P&L</div>
            <div className="text-xl font-bold text-gray-300">$ 0</div>
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
          <div className="text-xl font-bold text-gray-900">
            $ {profile?.balance?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-400">Ready for investment</div>
        </div>

        {/* Holdings Value Card */}
        <div className="flex flex-col">
          <div className="mb-1 text-xs text-gray-500">Portfolio Value</div>
          <div className="text-xl font-bold text-gray-900">
            $ {profile?.holdings?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-400">Current holdings total</div>
        </div>

        {/* Net P&L Card */}
        <div className="flex flex-col">
          <div className="mb-1 text-xs text-gray-500">Net P&L</div>
          <div className="text-xl font-bold text-gray-900">
            {isPositive ? '+' : ''}$ {netProfit.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            {isPositive ? 'Profitable' : 'Loss'} this period
          </div>
        </div>
      </div>
    </div>
  )
}
