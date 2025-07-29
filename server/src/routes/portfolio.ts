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
  const { stockId, volume, currentPrice } = req.body

  try {
    // 1. 查询 stock 信息
    const { data: stock, error: stockError } = await db
      .from('stocks')
      .select('symbol, name')
      .eq('id', stockId)
      .single()

    if (stockError || !stock) {
      return res.status(400).json({ success: false, message: 'Stock not found' })
    }

    // 2. 插入 portfolio_holdings
    const { data: insertedPortfolio, error: insertError } = await db
      .from('portfolio_holdings')
      .insert([
        {
          stock_id: stockId,
          volume,
          avg_price: currentPrice
        }
      ])
      .select()
      .single()

    if (insertError) {
      return res.status(500).json({ success: false, message: 'Failed to insert portfolio', error: insertError.message })
    }

    // 3. 查询旧的 profile
    const { data: oldProfile, error: profileError } = await db
      .from('profiles')
      .select('*')
      .single()

    if (profileError || !oldProfile) {
      return res.status(400).json({ success: false, message: 'Profile not found' })
    }
    console.log(oldProfile)

    // 4. 计算更新数据
    const addedValue = volume * currentPrice
    const newHoldings = Number(oldProfile.holdings) + addedValue
    const newBalance = Number(oldProfile.balance) - addedValue
    const newNetProfit = newHoldings + newBalance - Number(oldProfile.init_invest)

    const userId = oldProfile.id;

    // 5. 更新 profiles 表
    const { data: updatedProfile, error: updateProfileError } = await db
      .from('profiles')
      .update({
        holdings: newHoldings,
        balance: newBalance,
        net_profit: newNetProfit
      })
      .eq('id',userId)
      .select()
      .single()

    if (updateProfileError) {
      return res.status(500).json({ success: false, message: 'Failed to update profile', error: updateProfileError.message })
    }

    // 6. 返回结果
    return res.json({
      success: true,
      data: {
        portfolio: insertedPortfolio,
        profile: updatedProfile
      }
    })

  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ success: false, message: 'Unexpected server error' })
  }
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
