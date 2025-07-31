import React, { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { Stock, StockPrice } from '@/types/database'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { AnimatedNumber } from './ui/animated-number'

// 基于原有Stock类型扩展，添加最新价格信息
type StockWithPrice = Stock & {
  price: number
  date: string
  logo: string
}

interface StockChartProps {
  onRefresh?: () => void
  userBalance?: number
}

const StockChart: React.FC<StockChartProps> = ({ onRefresh, userBalance }) => {
  const [stocks, setStocks] = useState<StockWithPrice[]>([])
  const [selectedStock, setSelectedStock] = useState<StockWithPrice | null>(
    null,
  )
  const [priceData, setPriceData] = useState<StockPrice[]>([])
  const [stocksLoading, setStocksLoading] = useState(false)
  const [priceLoading, setPriceLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<7 | 15 | 30>(7)

  // 获取所有股票列表
  useEffect(() => {
    const fetchStocks = async () => {
      setStocksLoading(true)
      const response = await api.get('/stocks')

      if (response.data.success) {
        setStocks(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedStock(response.data.data[0])
        }
      } else {
        setError('Failed to fetch stocks')
        console.error('Error fetching stocks:', response)
      }
      setStocksLoading(false)
    }

    fetchStocks()
  }, [])

  // 当选择的股票或时间范围改变时，获取价格数据
  useEffect(() => {
    if (!selectedStock) return

    const fetchPriceData = async () => {
      setPriceLoading(true)
      setError(null)

      // 根据时间范围确定天数
      const days = timeRange

      const response = await api.get(
        `/stocks/${selectedStock.id}/prices?days=${days}`,
      )
      if (response.data.success) {
        // 按日期正序排列以便图表显示
        const sortedData = response.data.data.sort(
          (a: StockPrice, b: StockPrice) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        )
        setPriceData(sortedData)
      } else {
        setError('Failed to fetch price data')
        console.error('Error fetching price data:', response)
      }
      setPriceLoading(false)
    }

    fetchPriceData()
  }, [selectedStock, timeRange])

  // 格式化图表数据 - 使用 useMemo 避免不必要的重新计算
  const chartData = React.useMemo(
    () =>
      priceData.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        price: parseFloat(item.price.toString()),
      })),
    [priceData],
  )

  // 计算涨跌颜色 - 使用 useMemo 避免不必要的重新计算
  const chartColor = React.useMemo(() => {
    if (chartData.length < 2) return '#dc2626' // 默认红色
    const firstPrice = chartData[0].price
    const lastPrice = chartData[chartData.length - 1].price
    return lastPrice >= firstPrice ? '#16a34a' : '#dc2626' // 绿色涨，红色跌
  }, [chartData])

  const chartConfig = React.useMemo(
    () => ({
      price: {
        label: 'Price',
        color: chartColor,
      },
    }),
    [chartColor],
  ) satisfies ChartConfig

  // 股票列表项组件
  const StockListItem = ({ stock }: { stock: StockWithPrice }) => (
    <div
      key={stock.id}
      onClick={() => setSelectedStock(stock)}
      className={cn(
        'flex cursor-pointer items-center justify-between border-b border-transparent py-2 text-sm transition-colors last:border-b-0',
        selectedStock?.id === stock.id
          ? 'border-gray-200 text-gray-800'
          : 'text-gray-500',
      )}
    >
      <div className="min-w-10 flex-1">
        <div className="text-sm font-semibold">{stock.symbol}</div>
        <div className="truncate text-xs">
          {stock.name?.split(' ')[0] || ''}
        </div>
      </div>
      <div className="ml-3 text-right">
        <div className="text-sm font-semibold">
          <AnimatedNumber value={stock.price} prefix="$" />
        </div>
      </div>
    </div>
  )

  // 买入按钮组件 - 独立处理买入逻辑，避免影响图表渲染
  const BuyButton = React.memo(({ stock }: { stock: StockWithPrice }) => {
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [buyQuantity, setBuyQuantity] = useState('1')
    const [buyingStock, setBuyingStock] = useState<number | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleBuyStock = async () => {
      if (
        !buyQuantity ||
        isNaN(Number(buyQuantity)) ||
        Number(buyQuantity) <= 0
      ) {
        return
      }

      // 检查余额是否足够
      const totalCost = Number(buyQuantity) * stock.price
      if (userBalance !== undefined && totalCost > userBalance) {
        alert(
          `Insufficient balance. You need $${totalCost.toFixed(2)} but only have $${userBalance.toFixed(2)}`,
        )
        return
      }

      // 立即关闭 popover 并重置输入
      setPopoverOpen(false)
      setBuyQuantity('1')

      setBuyingStock(stock.id)
      const response = await api.post('/portfolio/buy', {
        stockId: stock.id,
        volume: Number(buyQuantity),
        currentPrice: stock.price,
      })

      if (response.data.success) {
        // 成功后显示成功状态
        setShowSuccess(true)

        // 使用返回的数据更新资产信息
        const { portfolio, profile } = response.data

        // 这里可以更新资产相关的状态
        // 比如余额、持仓等，具体取决于你的应用需要
        console.log('Portfolio updated:', portfolio)
        console.log('Profile updated:', profile)

        // 如果需要更新父组件的资产信息，可以调用回调
        onRefresh?.()

        // 重置输入为默认值
        setBuyQuantity('1')

        // 2秒后恢复按钮状态
        setTimeout(() => {
          setShowSuccess(false)
        }, 2000)
      } else {
        // 失败时才弹窗提示
        alert(response.data.error || 'Failed to buy stock')
      }
      setBuyingStock(null)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleBuyStock()
      }
    }

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={`px-4 py-1 text-sm font-medium transition-colors ${
              showSuccess
                ? 'text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
            onClick={() => setPopoverOpen(true)}
            disabled={buyingStock === stock.id || showSuccess}
          >
            {showSuccess
              ? 'Success!'
              : buyingStock === stock.id
                ? 'Buying...'
                : 'Buy'}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-48 p-3"
          align="end"
          side="top"
          sideOffset={6}
        >
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">
                <AnimatedNumber value={stock?.price} prefix="$ " />
              </span>
              <span className="text-muted-foreground ml-1">per share</span>
            </div>
            <div className="text-xs">
              {buyQuantity &&
                !isNaN(Number(buyQuantity)) &&
                Number(buyQuantity) > 0 && (
                  <div className="text-muted-foreground">
                    Total:{' '}
                    <AnimatedNumber
                      value={Number(buyQuantity) * stock.price}
                      prefix="$ "
                    />
                    {userBalance !== undefined && (
                      <span
                        className={`ml-2 ${Number(buyQuantity) * stock.price > userBalance ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {userBalance >= Number(buyQuantity) * stock.price
                          ? '✓'
                          : '✗'}
                      </span>
                    )}
                  </div>
                )}
            </div>
            <Input
              type="number"
              placeholder="Quantity"
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-8 focus:outline-none focus-visible:ring-0"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleBuyStock}
                disabled={
                  !buyQuantity ||
                  isNaN(Number(buyQuantity)) ||
                  Number(buyQuantity) <= 0 ||
                  (userBalance !== undefined &&
                    Number(buyQuantity) * stock.price > userBalance)
                }
                className="flex-1 bg-gray-900 px-3 py-1 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {buyingStock === stock?.id ? 'Buying...' : 'Buy'}
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
  })

  // 图表区域组件 - 使用 React.memo 避免不必要的重新渲染
  const ChartArea = React.memo(() => {
    if (!selectedStock) {
      return (
        <div className="flex h-full items-center justify-center text-gray-400">
          Select a stock to view chart
        </div>
      )
    }

    return (
      <div className="flex h-full min-w-0 flex-1 flex-col pl-4">
        <div className="mb-4 flex-shrink-0">
          <div className="flex justify-between">
            {/* Left: Company Info and Price */}
            <div className="flex-1">
              {/* Company Info and Logo */}
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={selectedStock.logo}
                  alt={selectedStock.name || ''}
                  className="h-8 w-8 flex-shrink-0 rounded object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                <div>
                  <h3 className="text-base font-bold">{selectedStock.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedStock.symbol}
                  </p>
                </div>
              </div>

              {/* Current Price and Change */}
              {chartData.length > 0 && (
                <div className="mt-3 flex items-center gap-4">
                  <span className="whitespace-nowrap text-sm font-bold text-gray-900">
                    <AnimatedNumber
                      value={chartData[chartData.length - 1].price}
                      prefix="$ "
                    />{' '}
                    USD
                  </span>

                  {chartData.length > 1 && (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const firstPrice = chartData[0].price
                        const lastPrice = chartData[chartData.length - 1].price
                        const priceChange = lastPrice - firstPrice
                        const percentChange = (priceChange / firstPrice) * 100
                        const isPositive = priceChange >= 0

                        return (
                          <>
                            <span className="whitespace-nowrap text-sm text-gray-900">
                              {isPositive ? '+' : ''}
                              <AnimatedNumber
                                value={Math.abs(priceChange)}
                                prefix="$ "
                              />
                            </span>
                            <div className="flex items-center gap-0.5">
                              <span className="whitespace-nowrap text-sm text-gray-900">
                                {isPositive ? '+' : ''}
                                <AnimatedNumber
                                  value={Math.abs(percentChange)}
                                  suffix="%"
                                />
                              </span>
                              <span
                                className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {isPositive ? '▲' : '▼'}
                              </span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Buttons */}
            <div className="ml-6 flex flex-col items-end justify-between gap-3">
              <BuyButton stock={selectedStock} />

              <div className="flex gap-4">
                <button
                  onClick={() => setTimeRange(7)}
                  className={`text-sm font-medium transition-colors ${
                    timeRange === 7
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeRange(15)}
                  className={`text-sm font-medium transition-colors ${
                    timeRange === 15
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  15D
                </button>
                <button
                  onClick={() => setTimeRange(30)}
                  className={`text-sm font-medium transition-colors ${
                    timeRange === 30
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  1M
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-4 border-t border-gray-200"></div>
        </div>

        {error && (
          <div className="mb-3 flex-shrink-0 rounded bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="min-h-0 w-full flex-1">
          {priceLoading ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              Loading...
            </div>
          ) : chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart
                data={chartData}
                margin={{ left: 5, right: 5, top: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={chartColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartColor}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  interval="preserveEnd"
                  minTickGap={30}
                  axisLine={false}
                  tickMargin={8}
                  allowDataOverflow={true}
                  tickFormatter={(value, index) => {
                    // 跳过第一个标签以避免与Y轴重叠
                    if (index === 0) return ''
                    return value
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(value) => Math.round(value).toString()}
                  width={30}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="linear"
                  dataKey="price"
                  stroke={chartColor}
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    )
  })

  return (
    <div className="flex h-[460px] rounded-lg bg-white p-4 shadow-sm">
      <div className="w-42 flex flex-col justify-between border-r pr-4">
        {stocksLoading ? (
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="min-w-10 flex-1">
              <div className="text-sm font-semibold">Loading...</div>
              <div className="truncate text-xs">Loading...</div>
            </div>
            <div className="ml-3 text-right">
              <div className="text-sm font-semibold">Loading...</div>
            </div>
          </div>
        ) : (
          <div className="scrollbar-hide overflow-y-auto overflow-x-hidden">
            {stocks.map((stock, idx) =>
              idx < 8 ? <StockListItem key={stock.id} stock={stock} /> : null,
            )}
          </div>
        )}
      </div>

      <ChartArea />
    </div>
  )
}

export default StockChart
