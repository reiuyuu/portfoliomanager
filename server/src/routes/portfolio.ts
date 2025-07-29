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
 *                   example: 0
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
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
router.delete('/:itemId', async (req, res) => {
  const { itemId } = req.params
  const parsedId = parseInt(itemId, 10)

  if (isNaN(parsedId)) {
    return res.status(400).json({ success: false, message: 'Invalid itemId' })
  }

  try {
    const { data: existingItem, error: selectError } = await db
      .from('portfolio_holdings')
      .select('id, stock_id, volume')
      .eq('id', parsedId)
      .single()

    if (selectError || !existingItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Portfolio item not found' })
    }

    const { data: priceData, error: priceError } = await db
      .from('stock_prices')
      .select('price')
      .eq('stock_id', existingItem.stock_id)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (priceError || !priceData) {
      return res
        .status(400)
        .json({ success: false, message: 'Price not found' })
    }

    const currentValue = existingItem.volume * priceData.price

    const { data: profileData, error: profileError } = await db
      .from('profiles')
      .select('id, balance, holdings, init_invest')
      .limit(1)
      .single()

    if (profileError || !profileData) {
      return res
        .status(400)
        .json({ success: false, message: 'Profile not found' })
    }

    const initInvest = profileData.init_invest
    if (initInvest === null || initInvest === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Initial investment (init_invest) is missing or invalid',
      })
    }

    const updatedBalance = (profileData.balance || 0) + currentValue
    const updatedHoldings = (profileData.holdings || 0) - currentValue
    const updatedNetProfit = updatedBalance + updatedHoldings - initInvest

    const { error: updateProfileError } = await db
      .from('profiles')
      .update({
        balance: updatedBalance,
        holdings: updatedHoldings,
        net_profit: updatedNetProfit,
      })
      .eq('id', profileData.id)

    if (updateProfileError) {
      return res
        .status(400)
        .json({ success: false, message: updateProfileError.message })
    }

    const { error: deleteError } = await db
      .from('portfolio_holdings')
      .delete()
      .eq('id', parsedId)

    if (deleteError) {
      return res
        .status(400)
        .json({ success: false, message: deleteError.message })
    }

    return res
      .status(200)
      .json({ success: true, message: 'Portfolio item deleted successfully' })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Unknown error' })
  }
})

export default router
