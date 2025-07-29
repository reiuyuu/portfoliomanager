import React, { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { Stock, StockPrice } from '@/types/database'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

// 基于原有Stock类型扩展，添加最新价格信息
type StockWithPrice = Stock & {
  price: number
  date: string
}

interface StockChartProps {
  onStockPurchased: () => void
}

const StockChart: React.FC<StockChartProps> = ({ onStockPurchased }) => {
  const [stocks, setStocks] = useState<StockWithPrice[]>([])
  const [selectedStock, setSelectedStock] = useState<StockWithPrice | null>(
    null,
  )
  const [priceData, setPriceData] = useState<StockPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buyingStock, setBuyingStock] = useState<number | null>(null)

  // 获取所有股票列表
  useEffect(() => {
    const fetchStocks = async () => {
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
    }

    fetchStocks()
  }, [])

  // 当选择的股票改变时，获取价格数据
  useEffect(() => {
    if (!selectedStock) return

    const fetchPriceData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(
          `/stocks/${selectedStock.id}/prices?days=10`,
        )
        if (response.data.success) {
          // 按日期正序排列以便图表显示
          const sortedData = response.data.data.sort(
            (a: StockPrice, b: StockPrice) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          setPriceData(sortedData)
        }
      } catch (err) {
        setError('Failed to fetch price data')
        console.error('Error fetching price data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPriceData()
  }, [selectedStock])

  // 买股票函数
  const handleBuyStock = async (stock: StockWithPrice) => {
    setBuyingStock(stock.id)
    const volume = prompt('Enter quantity to buy:')
    if (!volume || isNaN(Number(volume)) || Number(volume) <= 0) {
      setBuyingStock(null)
      return
    }

    const response = await api.post('/portfolio/buy', {
      stockId: stock.id,
      volume: Number(volume),
      currentPrice: stock.price,
    })

    if (response.data.success) {
      alert('Stock purchased successfully!')
      // 调用回调函数刷新数据
      onStockPurchased()
    } else {
      alert(response.data.error || 'Failed to buy stock')
    }
    setBuyingStock(null)
  }

  // 格式化图表数据
  const chartData = priceData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    price: parseFloat(item.price.toString()),
  }))

  // 计算涨跌颜色
  const getChartColor = () => {
    if (chartData.length < 2) return '#dc2626' // 默认红色
    const firstPrice = chartData[0].price
    const lastPrice = chartData[chartData.length - 1].price
    return lastPrice >= firstPrice ? '#16a34a' : '#dc2626' // 绿色涨，红色跌
  }

  const chartColor = getChartColor()

  const chartConfig = {
    price: {
      label: 'Price',
      color: chartColor,
    },
  } satisfies ChartConfig

  return (
    <>
      <h2 className="mb-3 text-lg font-semibold">Stocks & Recent Prices</h2>
      <div className="rounded-lg border bg-white">
        <div className="flex h-[560px]">
          <div className="w-48 flex-shrink-0 overflow-y-auto border-r p-4">
            <h3 className="mb-3 font-semibold">Stock List</h3>
            <div className="space-y-2">
              {stocks.map((stock) => (
                <div
                  key={stock.id}
                  className={`rounded border p-3 text-sm transition-colors ${
                    selectedStock?.id === stock.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div
                    onClick={() => setSelectedStock(stock)}
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-medium">
                        {stock.symbol}
                      </div>
                      <div className="truncate text-xs text-gray-600">
                        {stock.name?.split(' ')[0] || ''}
                      </div>
                    </div>
                    <div className="ml-2 flex flex-col items-end text-right">
                      <div className="mb-1 text-sm font-medium">
                        ${stock.price.toFixed(2)}
                      </div>
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBuyStock(stock)
                        }}
                        disabled={buyingStock === stock.id}
                      >
                        {buyingStock === stock.id ? 'Buying...' : 'Buy'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1 p-4">
            {selectedStock ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedStock.name}
                  </h3>
                  <p className="text-sm text-gray-600">Price History</p>
                </div>

                {error && (
                  <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex h-80 items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-80 min-h-[472px] w-full"
                  >
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={chartColor}
                        fill={chartColor}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="flex h-72 items-center justify-center">
                    <div className="text-gray-500">No data available</div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-72 items-center justify-center">
                <div className="text-gray-500">
                  Select a stock to view chart
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default StockChart
