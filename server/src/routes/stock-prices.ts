import { error } from 'console'
import { Router } from 'express'

import { db } from '../config/db'

const router = Router()

/**
 * @swagger
 * /api/stock-prices:
 *   get:
 *    tags: [stock-prices]
 *     summary: View current stock prices
 *     operationId: getCurrentPrices
 *     responses:
 *       200:
 *         description: Stock price data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StockPriceItem'
 *
 *       400:
 *         description: Bad request
 *         content:
 *           schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// GET /api/stock-prices
router.get('/', async (req, res) => {
  const { data: dateData, error: dateError } = await db
    .from('stock_prices')
    .select('date')
    .order('date', { ascending: false })
    .limit(1)

  if (dateError) {
    return res.status(400).json({
      success: false,
      error: dateError.message,
    })
  }

  const latestDate = dateData[0].date

  const { data: pricesData, error: pricesError } = await db
    .from('stock_prices')
    .select(
      `id,
    stock_id,
    stocks (
      symbol,
      name),
    price,
    date`,
    )
    .eq('date', latestDate)

  if (pricesError) {
    return res.status(400).json({
      success: false,
      error: pricesError.message,
    })
  }

  const flatData = pricesData.map((item) => ({
    id: item.id,
    stockId: item.stock_id,
    stockName: item.stocks.name,
    stockSymbol: item.stocks.symbol,
    price: item.price,
    date: item.date,
  }))

  return res.json({
    success: true,
    data: flatData,
  })
})

/**
 * @swagger
 * /api/stock-prices:
 *   get:
 *    tags: [stock-prices]
 *     summary: View historical prices of a stock
 *     operationId: getHistoricalPrices
 *     parameters:
 *       - name: stockId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock price data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StockPriceItem'
 *       404:
 *         description: Stock price item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *
 *       400:
 *         description: Bad request
 *         content:
 *           schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// GET /api/stock-prices/{stockId}
router.get('/:stockId', async (req, res) => {
  const stockId = parseInt(req.params.stockId, 10)

  if (isNaN(stockId)) {
    return res.status(400).json({
      success: false,
      error: 'Stock ID must be an integer',
    })
  }

  const { data: pricesData, error: pricesError } = await db
    .from('stock_prices')
    .select(
      `id,
    stock_id,
    stocks (
      symbol,
      name),
    price,
    date`,
    )
    .eq('stock_id', stockId)
    .order('date', { ascending: true })

  if (pricesError) {
    return res.status(400).json({
      success: false,
      error: pricesError.message,
    })
  }

  if (!pricesData || pricesData.length === 0) {
    return res.status(404).json({
      success: false,
      error: `No price data found for stockId ${stockId}`,
    })
  }

  const flatData = pricesData.map((item) => ({
    id: item.id,
    stockId: item.stock_id,
    stockName: item.stocks.name,
    stockSymbol: item.stocks.symbol,
    price: item.price,
    date: item.date,
  }))

  return res.json({
    success: true,
    data: flatData,
  })
})

export default router
