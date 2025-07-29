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


router.post('/buy', async (req, res) => {
  const { stockId, volume, currentPrice } = req.body

  if (
    typeof stockId !== 'number' ||
    typeof volume !== 'number' ||
    typeof currentPrice !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      error: 'Request must include numeric stockId, volume, and currentPrice',
    })
  }

  try {
    // 查询 stock 信息
    const { data: stock, error: stockError } = await db
      .from('stocks')
      .select('symbol, name')
      .eq('id', stockId)
      .single()

    if (stockError || !stock) {
      return res.status(400).json({ success: false, message: 'Stock not found' })
    }

    // 查询 profiles
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('*')
      .single()

    if (profileError || !profile) {
      return res.status(500).json({ success: false, message: 'Profile not found' })
    }

    const totalCost = volume * currentPrice
    if (profile.balance < totalCost) {
      return res.status(400).json({ success: false, error: 'Not enough balance' })
    }

    // 查询 portfolio_holdings 中是否已有该股票
    const { data: existingHolding, error: holdingError } = await db
      .from('portfolio_holdings')
      .select('*')
      .eq('stock_id', stockId)
      .single()

    let portfolioResult

    if (!existingHolding) {
      // 🆕 新增投资记录
      const { data: inserted, error: insertError } = await db
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

      portfolioResult = inserted

    } else {
      // 🔁 已有投资，更新持仓
      const newVolume = existingHolding.volume + volume
      const newAveragePrice =
        (existingHolding.avg_price * existingHolding.volume + volume * currentPrice) / newVolume

      const { data: updated, error: updateError } = await db
        .from('portfolio_holdings')
        .update({
          volume: newVolume,
          avg_price: newAveragePrice,
        })
        .eq('stock_id', stockId)
        .select()
        .single()

      if (updateError) {
        return res.status(500).json({ success: false, message: 'Failed to update portfolio', error: updateError.message })
      }

      portfolioResult = updated
    }

    // 更新 profile
    const newHoldings = profile.holdings + totalCost
    const newBalance = profile.balance - totalCost
    const newNetProfit = newHoldings + newBalance - profile.init_invest

    const { data: updatedProfile, error: updateProfileError } = await db
      .from('profiles')
      .update({
        holdings: newHoldings,
        balance: newBalance,
        net_profit: newNetProfit,
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateProfileError) {
      return res.status(500).json({ success: false, message: 'Failed to update profile', error: updateProfileError.message })
    }

    // 成功返回
    return res.json({
      success: true,
      data: {
        portfolio: portfolioResult,
        profile: updatedProfile,
      },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ success: false, message: 'Unexpected server error' })
  }
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
