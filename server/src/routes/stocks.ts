import { Router } from 'express'

import { db } from '../config/db'

const router = Router()

// GET /api/stocks
// router.get('/', async (req, res) => {
//   try {
//     // TODO: Implement stocks retrieval with pagination logic
//     const limit = Math.min(
//       Math.max(parseInt(req.query.limit as string) || 10, 1),
//       100,
//     )
//     const offset = Math.max(parseInt(req.query.offset as string) || 0, 0)

//     let query = db
//       .from('stocks')
//       .select('id, symbol, name', { count: 'exact' })
//       .order('id', { ascending: true })
//       .range(offset, offset + limit - 1)

//     const { data, count, error } = await query

//     if (error) {
//       console.error('Error querying stocks:', error)
//       return res
//         .status(500)
//         .json({ success: false, message: 'Internal Server Error' })
//     }

//     const hasNext = count !== null ? offset + limit < count : false
//     const hasPrev = offset > 0

//     return res.status(200).json({
//       success: true,
//       data,
//       pagination: {
//         total: count || 0,
//         limit,
//         offset,
//         hasNext,
//         hasPrev,
//       },
//     })
//   } catch (err) {
//     console.error('Unexpected error:', err)
//     return res
//       .status(500)
//       .json({ success: false, message: 'Unexpected Server Error' })
//   }
// })

router.get('/', async (req, res) => {
  const { data, error } = await db
    .from('stocks')
    .select(
      `
      id, symbol, name,
      stock_prices!inner(price, date)
    `,
    )
    .order('id', { ascending: true })
    .order('date', { foreignTable: 'stock_prices', ascending: false })
    .limit(1, { foreignTable: 'stock_prices' })

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  // Format data to include latest_price
  const stocks = data.map((stock) => ({
    // ...stock,
    id: stock.id,
    symbol: stock.symbol,
    name: stock.name,
    latest_price: stock.stock_prices[0]?.price || 0,
  }))

  res.json({ success: true, data: stocks })
})

// GET /api/stocks/:id/prices?days=10
router.get('/:id/prices', async (req, res) => {
  const { days = 10 } = req.query
  const stockId = req.params.id

  const { data, error } = await db
    .from('stock_prices')
    .select('*')
    .eq('stock_id', stockId)
    .order('date', { ascending: false })
    .limit(Number(days))

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, data })
})

export default router
