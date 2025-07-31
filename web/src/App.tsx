import { useEffect, useState } from 'react'

import type { Profile } from '@/types/database'
import api from '@/lib/api'
import { PortfolioHoldings } from '@/components/PortfolioHoldings'
import { ProfileSummary } from '@/components/ProfileSummary'
import StockChart from '@/components/StockChart'

interface PortfolioData {
  id: number
  symbol: string
  name: string | null
  volume: number
  averagePrice: number
  currentPrice: number | null
}

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true)
    }

    const [profileResponse, portfolioResponse] = await Promise.all([
      api.get('/profiles'),
      api.get('/portfolio'),
    ])

    if (profileResponse.data.success) {
      setProfile(profileResponse.data.data)
    }

    if (portfolioResponse.data.success) {
      setPortfolio(portfolioResponse.data.data || [])
    }

    if (showLoading) {
      setLoading(false)
    }
  }

  // 用于更新数据
  const refresh = () => fetchData(false)

  useEffect(() => {
    fetchData(true) // 初次加载显示loading
  }, [])

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Portfolio Manager
          </h1>
        </div>

        <div className="my-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                Portfolio Summary
              </h2>
              <ProfileSummary profile={profile} loading={loading} />
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                My Holdings
              </h2>
              <PortfolioHoldings
                portfolio={portfolio}
                loading={loading}
                onRefresh={refresh}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Market Overview
            </h2>
            <StockChart userBalance={profile?.balance} onRefresh={refresh} />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Made by HappyFriday Team</p>
        </div>
      </div>
    </div>
  )
}

export default App
