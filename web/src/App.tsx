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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto flex min-h-64 w-full max-w-[1400px] flex-1 flex-col px-6 py-8">
        {/* Header with centered title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Portfolio Manager
          </h1>
        </div>

        {/* Portfolio Summary and Avatar row */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            Portfolio Summary
          </h2>
          <div className="flex items-start justify-between">
            <div className="w-1/2">
              <ProfileSummary profile={profile} loading={loading} />
            </div>

            {/* User Avatar */}
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
                <span className="text-lg font-semibold text-gray-600">HF</span>
              </div>
              <div className="text-center text-xs text-gray-600">
                <div className="font-medium">Happy Friday</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid min-h-64 flex-1 grid-cols-1 gap-8 lg:grid-cols-10">
          <div className="flex min-h-0 flex-col lg:col-span-5">
            <PortfolioHoldings
              portfolio={portfolio}
              loading={loading}
              onRefresh={refresh}
            />
          </div>
          <div className="flex min-h-0 flex-col lg:col-span-5">
            <StockChart
              userBalance={profile?.balance}
              onPortfolioUpdate={(data) => {
                // 更新用户信息
                if (data.profile) {
                  setProfile(data.profile as Profile)
                }
                // 更新持仓数据 - 由于返回的数据不包含完整的股票信息，
                // 我们需要刷新持仓数据来获取完整信息
                refresh()
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 flex-shrink-0 text-center text-sm text-gray-500">
          Happy Friday
        </p>
      </div>
    </div>
  )
}

export default App
