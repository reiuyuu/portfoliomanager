import { useEffect, useState } from 'react'

import type { Profile } from '@/types/database'
import api from '@/lib/api'

export function ProfileSummary() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const profileResponse = await api.get('/profiles')
    if (profileResponse.data.success) {
      setProfile(profileResponse.data.data)
    } else {
      setError('Failed to load profile data')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="text-center text-red-600">{error}</div>
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
