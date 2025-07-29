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

  // 用于买股票后的静默更新
  const refreshData = () => fetchData(false)

  useEffect(() => {
    fetchData(true) // 初次加载显示loading
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container relative mx-auto h-full px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Portfolio Manager</h1>
        </div>

        <div className="mx-auto max-w-7xl space-y-10">
          <ProfileSummary profile={profile} loading={loading} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-9">
            <div className="lg:col-span-4">
              <PortfolioHoldings portfolio={portfolio} loading={loading} />
            </div>
            <div className="lg:col-span-5">
              <StockChart onStockPurchased={refreshData} />
            </div>
          </div>
        </div>
        <div className="mt-12 pb-4 text-center text-sm text-gray-500">
          <p>Happy Friday</p>
          {/* <p>Made with ❤️ by Happy Friday Team</p> */}
        </div>
      </div>
    </div>
  )
}

export default App
