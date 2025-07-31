import { Router } from 'express'

import { db } from '../config/db'

const router = Router()

router.get('/', async (_req, res) => {
  const { data, error } = await db
    .from('stocks')
    .select(
      `id, symbol, name,
      stock_prices!inner(price, date)`,
    )
    .order('id', { ascending: true })
    .order('date', { foreignTable: 'stock_prices', ascending: false })
    .limit(1, { foreignTable: 'stock_prices' })

  if (error)
    return res.status(400).json({ success: false, error: error.message })

  const result = data?.map(({ id, symbol, name, stock_prices }: any) => {
    // TODO: bad design here
    const logo = `${process.env.SUPABASE_URL}/storage/v1/object/public/stock-logos/${symbol}.svg`
    const { price, date } = stock_prices[0]
    return {
      id,
      symbol,
      name,
      logo,
      price,
      date,
    }
  })

  res.json({ success: true, data: result })
})

router.get('/:id/prices', async (req, res) => {
  const { days = 10 } = req.query
  const stockId = req.params.id

  const { data, error } = await db
    .from('stock_prices')
    .select('*')
    .eq('stock_id', stockId)
    .order('date', { ascending: false })
    .limit(Number(days))

  if (error)
    return res.status(400).json({ success: false, error: error.message })

  res.json({ success: true, data })
})

export default router
