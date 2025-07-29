import { Router } from 'express'

import { db } from '../config/db'

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
  // TODO: Implement portfolio retrieval logic
  res.json({ success: true, data: [], count: 0 })
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
 * /api/portfolio/{stockId}:
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
 *                   type: object
 *                   properties:
 *                     portfolio:
 *                       $ref: '#/components/schemas/PortfolioItem'
 *                     profile:
 *                       $ref: '#/components/schemas/UserItem'
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
// PUT /api/portfolio/:stockId
router.put('/:stockId', async (req, res) => {
  const stockId = parseInt(req.params.stockId, 10)

  if (isNaN(stockId)) {
    return res.status(400).json({
      success: false,
      error: 'Stock ID must be an integer',
    })
  }

  const { additionalVolume, currentPrice } = req.body
  if (
    typeof additionalVolume !== 'number' ||
    typeof currentPrice !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      error: 'Request body must include numeric volume, and currentPrice',
    })
  }

  // Get current profile
  const { data: existingProfile, error: fetchProfileError } = await db
    .from('profiles')
    .select('*')
    .single()

  if (existingProfile.balance < additionalVolume * currentPrice) {
    return res.status(400).json({
      success: false,
      error: 'Not enough cash',
    })
  }

  // Get current volume and current average price
  const { data: existingItem, error: fetchItemError } = await db
    .from('portfolio_holdings')
    .select('*')
    .eq('stock_id', stockId)
    .single()

  if (!existingItem || existingItem.length === 0) {
    return res.status(404).json({
      success: false,
      error: `No portfolio item with id ${stockId}`,
    })
  }

  // Update volume and average price
  const newVolume = existingItem.volume + additionalVolume
  const newAveragePrice =
    (existingItem.avg_price * existingItem.volume +
      additionalVolume * currentPrice) /
    newVolume

  const { data: updatedPortfolio, error: updatePortfolioErr } = await db
    .from('portfolio_holdings')
    .update({
      volume: newVolume,
      avg_price: newAveragePrice,
    })
    .eq('stock_id', stockId)
    .select('*')
    .single()

  if (updatePortfolioErr) {
    return res.status(400).json({
      success: false,
      error: updatePortfolioErr.message,
    })
  }

  // Update profile
  const newHoldings = existingProfile.holdings + additionalVolume * currentPrice
  const newBalance = existingProfile.balance - additionalVolume * currentPrice
  const newNetProfit = newHoldings + newBalance - existingProfile.init_invest

  const { data: updatedProfile, error: updateProfileErr } = await db
    .from('profiles')
    .update({
      holdings: newHoldings,
      balance: newBalance,
      net_profit: newNetProfit,
    })
    .eq('id', existingProfile.id)
    .select('*')
    .single()

  res.json({
    success: true,
    data: {
      portfolio: updatedPortfolio,
      profile: updatedProfile,
    },
  })
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
