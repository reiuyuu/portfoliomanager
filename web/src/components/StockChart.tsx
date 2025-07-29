import React, { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { Stock, StockPrice } from '@/types/database'
import api from '@/lib/api'
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

const StockChart: React.FC = () => {
  const [stocks, setStocks] = useState<StockWithPrice[]>([])
  const [selectedStock, setSelectedStock] = useState<StockWithPrice | null>(
    null,
  )
  const [priceData, setPriceData] = useState<StockPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // 格式化图表数据
  const chartData = priceData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    price: parseFloat(item.price.toString()),
  }))

  const chartConfig = {
    price: {
      label: 'Price',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  return (
    <div className="flex h-96">
      <div className="w-1/3 overflow-y-scroll border-r bg-white p-4">
        <h2 className="mb-4 text-xl font-bold">Stocks</h2>
        <div className="space-y-2">
          {stocks.map((stock) => (
            <div
              key={stock.id}
              onClick={() => setSelectedStock(stock)}
              className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
                selectedStock?.id === stock.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {stock.symbol}
                  </h3>
                  <p className="text-sm text-gray-600">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${stock.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6">
        {selectedStock ? (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedStock.symbol} - {selectedStock.name}
              </h1>
              <p className="text-gray-600">Last 10 Days Price Chart</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-h-40 w-full">
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
                    stroke="var(--color-price)"
                    fill="var(--color-price)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-96 items-center justify-center">
                <div className="text-gray-500">No price data available</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center">
            <div className="text-gray-500">
              Select a stock to view its chart
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockChart
