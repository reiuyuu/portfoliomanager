import axios from 'axios'

import { db } from './src/config/db'

const API_KEY = process.env.STOCKS_API_KEY
const BASE_URL = 'https://api.twelvedata.com/price'

interface StockInfo {
  id: number
  symbol: string
}

// get specific stock current price
async function getCurrentPrice(symbol: string): Promise<number | null> {
  try {
    const res = await axios.get(
      `${BASE_URL}?symbol=${symbol}&apikey=${API_KEY}`,
    )
    const price = res.data?.price
    if (!price) return null
    return Number(price)
  } catch (err) {
    console.error(`Get ${symbol} price failed:`, err)
    return null
  }
}

async function updateSymbolPriviousPrice() {
  const { data: stockData, error: stockErr } = await db
    .from('stocks')
    .select('id,symbol')

  if (stockErr) {
    console.error('Error fetching stocks:', stockErr)
    return
  }

  const stocksList: StockInfo[] = stockData || []
  console.log('Fetched stocks:', stocksList)

  for (const stock of stocksList) {
    const stockId = stock.id
    const symbol = stock.symbol
    console.log(symbol)

    const apiUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&apikey=${API_KEY}&source=docs`
    const res = await axios.get(apiUrl)

    const formattedData = res.data.values.map((item: any) => ({
      stock_id: stockId,
      price: parseFloat(item.low),
      date: item.datetime,
      created_at: new Date().toISOString(),
    }))

    const { error } = await db.from('stock_prices').insert(formattedData)

    if (error) {
      console.error('Insert failed:', error)
    } else {
      console.log(
        `Insert ${formattedData.length} number ${symbol}'s data successfully `,
      )
    }
  }
}

// async function updateStockPrices() {
//   const { data: stockData, error: stockErr } = await db
//     .from('stocks')
//     .select('id,symbol')

//   if (stockErr) {
//     console.error('Error fetching stocks:', stockErr)
//     return
//   }

//   const stocksList: StockInfo[] = stockData || []
//   console.log('Fetched stocks:', stocksList)

//   for (const stock of stocksList) {
//     const price = await getCurrentPrice(stock.symbol)
//     if (price === null) continue

//     const today = new Date().toISOString().slice(0, 10)

//     const { error: insertErr } = await db.from('stock_prices').insert([
//       {
//         stock_id: stock.id,
//         price,
//         date: today,
//         created_at: new Date(),
//       },
//     ])

//     if (insertErr) {
//       console.error(`Insert ${stock.symbol} price failed:`, insertErr)
//     } else {
//       console.log(
//         `✅ Inserted ${stock.symbol} (stock_id=${stock.id}) price $${price}`,
//       )
//     }
//   }

//   console.log("📈 All stocks' current price updated!")
// }

updateSymbolPriviousPrice()
