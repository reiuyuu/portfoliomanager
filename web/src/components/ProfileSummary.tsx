import type { Profile } from '@/types/database'

interface ProfileSummaryProps {
  profile: Profile | null
  loading: boolean
}

export function ProfileSummary({ profile, loading }: ProfileSummaryProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-gray-50">
        <h2 className="mb-3 text-lg font-semibold">Portfolio Summary</h2>
        <div className="text-center text-sm text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-gray-50">
      <h2 className="mb-3 text-lg font-semibold">Portfolio Summary</h2>
      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span>Cash:</span>
          <span className="font-medium">
            ${profile?.balance?.toLocaleString() || '0'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Holdings Value:</span>
          <span className="font-medium">
            ${profile?.holdings?.toLocaleString() || '0'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Net P&L:</span>
          <span
            className={`font-medium ${(profile?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {(profile?.net_profit || 0) >= 0 ? '+' : ''}$
            {profile?.net_profit?.toLocaleString() || '0'}
          </span>
        </div>
      </div>
    </div>
  )
}
