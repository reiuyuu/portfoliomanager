import { useState } from 'react'

import api from '../lib/api'
import { AnimatedNumber } from './ui/animated-number'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

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

  // Sell Button Component
  const SellButton = ({ item }: { item: PortfolioData }) => {
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [sellQuantity, setSellQuantity] = useState('1')
    const [showSuccess, setShowSuccess] = useState(false)

    const handleSellStock = async () => {
      if (
        !sellQuantity ||
        isNaN(Number(sellQuantity)) ||
        Number(sellQuantity) <= 0
      ) {
        return
      }

      // 检查数量是否超过持有量
      if (Number(sellQuantity) > item.volume) {
        alert(
          `Insufficient shares. You only have ${item.volume} shares but trying to sell ${sellQuantity}`,
        )
        return
      }

      // 立即关闭 popover 并重置输入
      setPopoverOpen(false)
      setSellQuantity('1')

      setSellLoading(item.id)
      const response = await api.post('/portfolio/sell', {
        stockId: item.id,
        volume: Number(sellQuantity),
        currentPrice: item.currentPrice || 0,
      })

      if (response.data.success) {
        // 成功后显示成功状态
        setShowSuccess(true)

        // 如果需要更新父组件的资产信息，可以调用回调
        onRefresh?.()

        // 重置输入为默认值
        setSellQuantity('1')

        // 2秒后恢复按钮状态
        setTimeout(() => {
          setShowSuccess(false)
        }, 2000)
      } else {
        // 失败时才弹窗提示
        alert(response.data.message || 'Failed to sell stock')
      }
      setSellLoading(null)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSellStock()
      }
    }

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={`px-4 py-1 text-sm font-medium transition-colors ${
              showSuccess
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setPopoverOpen(true)}
            disabled={sellLoading === item.id || showSuccess}
          >
            {showSuccess
              ? 'Success!'
              : sellLoading === item.id
                ? 'Selling...'
                : 'Sell'}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-48 p-3"
          align="start"
          side="right"
          sideOffset={6}
        >
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">
                {item.currentPrice ? (
                  <AnimatedNumber value={item.currentPrice} prefix="$ " />
                ) : (
                  'N/A'
                )}
              </span>
              <span className="text-muted-foreground ml-1">per share</span>
            </div>
            <div className="text-xs">
              {sellQuantity &&
                !isNaN(Number(sellQuantity)) &&
                Number(sellQuantity) > 0 && (
                  <div className="text-muted-foreground">
                    <div className="text-xs">
                      Available: <AnimatedNumber value={item.volume} /> shares
                      <span
                        className={`ml-2 ${Number(sellQuantity) > item.volume ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {Number(sellQuantity) <= item.volume ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                )}
            </div>
            <Input
              type="number"
              placeholder="Quantity"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-8 focus:outline-none focus-visible:ring-0"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSellStock}
                disabled={
                  !sellQuantity ||
                  isNaN(Number(sellQuantity)) ||
                  Number(sellQuantity) <= 0 ||
                  Number(sellQuantity) > item.volume
                }
                className="flex-1 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                {sellLoading === item.id ? 'Selling...' : 'Sell'}
              </button>
              <button
                onClick={() => setPopoverOpen(false)}
                className="flex-1 border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[310px] items-center justify-center rounded-lg bg-white p-4 text-gray-500 shadow-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-[310px] rounded-lg bg-white p-4 shadow-sm">
      <div className="flex w-full flex-col">
        {portfolio.length > 0 ? (
          <>
            {/* Header Row */}
            <div className="mb-2 flex items-center border-b border-gray-200 pb-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-500">Stock</div>
              </div>
              <div className="ml-3 flex flex-1 items-center space-x-6">
                <div className="w-16 text-right text-xs font-medium text-gray-500">
                  Qty
                </div>
                <div className="w-20 text-right text-xs font-medium text-gray-500">
                  Avg
                </div>
                <div className="w-20 text-right text-xs font-medium text-gray-500">
                  Current
                </div>
                <div className="w-24 text-right text-xs font-medium text-gray-500">
                  P&L
                </div>
                <div className="w-20 text-center text-xs font-medium text-gray-500">
                  Action
                </div>
              </div>
            </div>

            {/* Data Rows */}
            <div className="scrollbar-hide space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {portfolio.map((item) => {
                const pnl = calculatePnL(item)
                const isPositive = pnl >= 0
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{item.symbol}</div>
                      <div className="truncate text-xs text-gray-500">
                        {item.name?.split(' ')[0] || ''}
                      </div>
                    </div>
                    <div className="ml-3 flex flex-1 items-center space-x-6">
                      <div className="w-16 text-right text-xs">
                        <div className="text-sm font-semibold">
                          <AnimatedNumber value={item.volume} />
                        </div>
                      </div>
                      <div className="w-20 text-right text-xs">
                        <div className="text-sm font-semibold">
                          <AnimatedNumber
                            value={item.averagePrice}
                            prefix="$ "
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right text-xs">
                        <div className="text-sm font-semibold">
                          {item.currentPrice ? (
                            <AnimatedNumber
                              value={item.currentPrice}
                              prefix="$ "
                            />
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </div>
                      <div className="w-24 text-right text-xs">
                        <div
                          className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                        >
                          <AnimatedNumber
                            value={Math.abs(pnl)}
                            prefix={isPositive ? '+$ ' : '-$ '}
                            className={
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }
                          />
                        </div>
                      </div>
                      <div className="w-20 text-center">
                        <SellButton item={item} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No holdings yet. Start by buying some stocks!
          </div>
        )}
      </div>
    </div>
  )
}
