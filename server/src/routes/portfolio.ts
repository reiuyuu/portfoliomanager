import { Router } from 'express'
import { db } from '../config/db.js'

const router = Router()

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Browse a portfolio
 *     tags: [Portfolio]
 *     operationId: getPortfolio
 *     responses:
 *       200:
 *         description: List of portfolio items retrieved successfully
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
 *                     $ref: '#/components/schemas/PortfolioItem'
 *                 count:
 *                   type: number
 *                   example: 5
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// GET /api/portfolio
router.get('/', async (req, res) => {
  try {
    // 第一步：获取 portfolio_holdings 及其 stocks 信息
    const { data: holdings, error } = await db
      .from('portfolio_holdings')
      .select(`
        id,
        volume,
        averagePrice: avg_price,
        stock_id,
        stocks (
          id,
          symbol,
          name
        )
      `)

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    // 第二步：为每个股票查询最新一条 price（并发查）
    const result = await Promise.all(
      holdings.map(async (item) => {
        const { data: latestPrice } = await db
          .from('stock_prices')
          .select('price')
          .eq('stock_id', item.stock_id)
          .order('date', { ascending: false })
          .limit(1)
          .single() // 只取一条记录

        return {
          ...item.stocks,
          volume: item.volume,
          averagePrice: item.averagePrice,
          currentPrice: latestPrice?.price ?? null
        }
      })
    )

    res.json({
      success: true,
      data: result,
      count: result.length
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/portfolio/add:
 *   post:
 *     summary: Add item to portfolio
 *     tags: [Portfolio]
 *     operationId: addPortfolioItem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioItemInput'
 *     responses:
 *       201:
 *         description: Portfolio item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     portfolio:
 *                       $ref: '#/components/schemas/PortfolioItem'
 *                     users:
 *                       type: object
 *                       properties:
 *                         total_value:
 *                           type: number
 *                         holdings_count:
 *                           type: integer
 *                     transaction_history:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         action:
 *                           type: string
 *                         amount:
 *                           type: number
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// POST /api/portfolio/add
router.post('/add', async (req, res) => {
  // TODO: 实际数据库操作
  // 1. 插入 portfolio 表
  // 2. 更新 users 表统计
  // 3. 插入 transaction_history 表

  res.status(201).json({
    success: true,
    data: {
      portfolio: { id: 123, symbol: 'AAPL', quantity: 10 },
      users: { total_value: 25000, holdings_count: 8 },
      transaction_history: { id: 456, action: 'BUY', amount: 1500 },
    },
  })
})

/**
 * @swagger
 * /api/portfolio/{itemId}:
 *   put:
 *     summary: Modify item of the portfolio
 *     tags: [Portfolio]
 *     operationId: modifyPortfolioItem
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The portfolio item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioItemInput'
 *     responses:
 *       200:
 *         description: Portfolio item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioItem'
 *       404:
 *         description: Portfolio item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// PUT /api/portfolio/:itemId
router.put('/:itemId', async (req, res) => {
  // TODO: Implement portfolio item update logic
  res.json({ success: true, data: {} })
})

/**
 * @swagger
 * /api/portfolio/{itemId}:
 *   delete:
 *     summary: Remove item from portfolio
 *     tags: [Portfolio]
 *     operationId: deletePortfolioItem
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The portfolio item ID to delete
 *     responses:
 *       200:
 *         description: Portfolio item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Portfolio item deleted successfully
 *       404:
 *         description: Portfolio item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// DELETE /api/portfolio/:itemId
router.delete('/:itemId', async (req, res) => {
  // TODO: Implement portfolio item deletion logic
  res.json({ success: true, message: 'Portfolio item deleted successfully' })
})

export default router
