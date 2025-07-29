import { PortfolioHoldings } from '@/components/PortfolioHoldings'
import { ProfileSummary } from '@/components/ProfileSummary'
import StockChart from '@/components/StockChart'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Stock Portfolio Manager</h1>
        </div>

        <div className="mx-auto max-w-7xl space-y-6">
          <ProfileSummary />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PortfolioHoldings />
            <div>
              <StockChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
