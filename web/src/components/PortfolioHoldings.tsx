import { Button } from './ui/button'

interface PortfolioData {
  id: number
  symbol: string
  name: string | null
  volume: number
  averagePrice: number
  currentPrice: number | null
}

interface PortfolioHoldingsProps {
  portfolio: PortfolioData[]
  loading: boolean
}

export function PortfolioHoldings({ portfolio, loading }: PortfolioHoldingsProps) {
  const calculatePnL = (item: PortfolioData) => {
    if (!item.currentPrice) return 0
    return (item.currentPrice - item.averagePrice) * item.volume
  }

  if (loading) {
    return (
      <div>
        <h2 className="mb-3 text-lg font-semibold">My Holdings</h2>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-center text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">My Holdings</h2>
      <div className="rounded-lg border bg-white p-4">
        {portfolio.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-1 py-2 text-left">Symbol</th>
                  <th className="px-1 py-2 text-left">Qty</th>
                  <th className="px-1 py-2 text-left">Avg Price</th>
                  <th className="px-1 py-2 text-left">Current</th>
                  <th className="px-1 py-2 text-left">P&L</th>
                  <th className="px-1 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => {
                  const pnl = calculatePnL(item)
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="px-1 py-2 font-medium">{item.symbol}</td>
                      <td className="px-1 py-2">{item.volume}</td>
                      <td className="px-1 py-2">
                        ${item.averagePrice.toFixed(2)}
                      </td>
                      <td className="px-1 py-2">
                        {item.currentPrice
                          ? `$${item.currentPrice.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td
                        className={`px-1 py-2 ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {pnl >= 0 ? '+' : ''}
                        {pnl.toFixed(0)}
                      </td>
                      <td className="px-1 py-2">
                        <Button variant="outline" size="sm">
                          Sell
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No holdings yet. Start by buying some stocks!
          </div>
        )}
      </div>
    </div>
  )
}
