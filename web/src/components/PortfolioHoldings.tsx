import { useState } from 'react'

import api from '../lib/api'
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
  onRefresh?: () => void
}

export function PortfolioHoldings({
  portfolio,
  loading,
  onRefresh,
}: PortfolioHoldingsProps) {
  const [sellLoading, setSellLoading] = useState<number | null>(null)

  const calculatePnL = (item: PortfolioData) => {
    if (!item.currentPrice) return 0
    return (item.currentPrice - item.averagePrice) * item.volume
  }

  const handleSell = async (stockId: number, symbol: string) => {
    if (!confirm(`Are you sure you want to sell all shares of ${symbol}?`)) {
      return
    }

    setSellLoading(stockId)
    const response = await api.post('/portfolio/sell', { stockId })
    if (response.data.success) {
      onRefresh?.()
      alert('Stock sold successfully!')
    } else {
      alert(response.data.message || 'Failed to sell stock')
    }
    setSellLoading(null)
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <h2 className="mb-3 flex-shrink-0 text-lg font-bold">My Holdings</h2>
        <div className="flex flex-1 items-center justify-center rounded-lg bg-white p-4 text-gray-500 shadow-sm">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-3 flex-shrink-0 text-lg font-bold">My Holdings</h2>
      <div className="flex-1 overflow-auto rounded-lg bg-white p-4 shadow-sm">
        {portfolio.length > 0 ? (
          <table className="w-full text-xs">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-2 text-left font-semibold">Symbol</th>
                <th className="p-2 text-left font-semibold">Qty</th>
                <th className="p-2 text-left font-semibold">Avg Price</th>
                <th className="p-2 text-left font-semibold">Current</th>
                <th className="p-2 text-left font-semibold">P&L</th>
                <th className="p-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => {
                const pnl = calculatePnL(item)
                const isPositive = pnl >= 0
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-2 font-medium">{item.symbol}</td>
                    <td className="px-2 py-2">{item.volume}</td>
                    <td className="px-2 py-2">
                      ${item.averagePrice.toFixed(2)}
                    </td>
                    <td className="px-2 py-2">
                      {item.currentPrice
                        ? `$${item.currentPrice.toFixed(2)}`
                        : 'N/A'}
                    </td>
                    <td
                      className={`px-2 py-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {isPositive ? '+' : ''}
                      {pnl.toFixed(0)}
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-16"
                        onClick={() => handleSell(item.id, item.symbol)}
                        disabled={sellLoading === item.id}
                      >
                        {sellLoading === item.id ? 'Selling...' : 'Sell'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No holdings yet. Start by buying some stocks!
          </div>
        )}
      </div>
    </div>
  )
}
