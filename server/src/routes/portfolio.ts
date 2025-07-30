import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    // 第一步：获取 portfolio_holdings 及其 stocks 信息
    const { data: holdings, error } = await db.from('portfolio_holdings')
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
          currentPrice: latestPrice?.price ?? null,
        }
      }),
    )

    res.json({
      success: true,
      data: result,
      count: result.length,
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
      return res
        .status(400)
        .json({ success: false, message: 'Stock not found' })
    }

    // 查询 profiles
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('*')
      .single()

    if (profileError || !profile) {
      return res
        .status(500)
        .json({ success: false, message: 'Profile not found' })
    }

    const totalCost = volume * currentPrice
    if (profile.balance < totalCost) {
      return res
        .status(400)
        .json({ success: false, error: 'Not enough balance' })
    }

    // 查询 portfolio_holdings 中是否已有该股票
    const { data: existingHolding } = await db
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
            avg_price: currentPrice,
          },
        ])
        .select()
        .single()

      if (insertError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to insert portfolio',
          error: insertError.message,
        })
      }

      portfolioResult = inserted
    } else {
      // 🔁 已有投资，更新持仓
      const newVolume = existingHolding.volume + volume
      const newAveragePrice =
        (existingHolding.avg_price * existingHolding.volume +
          volume * currentPrice) /
        newVolume

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
        return res.status(500).json({
          success: false,
          message: 'Failed to update portfolio',
          error: updateError.message,
        })
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
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: updateProfileError.message,
      })
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
    return res
      .status(500)
      .json({ success: false, message: 'Unexpected server error' })
  }
})

router.post('/sell', async (req, res) => {
  const { stockId, volume, currentPrice } = req.body
  const parsedStockId = parseInt(stockId, 10)
  const parsedVolume = parseInt(volume, 10)
  const parsedPrice = parseFloat(currentPrice)

  // 基础校验
  if (
    isNaN(parsedStockId) ||
    isNaN(parsedVolume) || parsedVolume <= 0 ||
    isNaN(parsedPrice) || parsedPrice <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid stockId, volume, or currentPrice',
    })
  }

  try {
    // 查找持仓
    const { data: existingItem, error: selectError } = await db
      .from('portfolio_holdings')
      .select('id, stock_id, volume, avg_price')
      .eq('stock_id', parsedStockId)
      .single()

    if (selectError || !existingItem) {
      return res.status(404).json({ success: false, message: 'Portfolio item not found' })
    }

    if (parsedVolume > existingItem.volume) {
      return res.status(400).json({ success: false, message: 'Sell volume exceeds holding volume' })
    }

    // 卖的价值
    const sellValue = parsedVolume * parsedPrice
    // // 卖的成本
    // const sellCost = parsedVolume * existingItem.avg_price

    // 查找 profile
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, balance, holdings, init_invest')
      .limit(1)
      .single()

    if (profileError || !profile) {
      return res.status(400).json({ success: false, message: 'Profile not found' })
    }

    const { id: profileId, balance, holdings, init_invest } = profile

    if (init_invest == null) {
      return res.status(400).json({ success: false, message: 'Initial investment is missing' })
    }

    // 更新 profile
    const updatedBalance = balance + sellValue
    const updatedHoldings = holdings - sellValue
    const updatedNetProfit = updatedBalance + updatedHoldings - init_invest

    const { error: updateProfileError } = await db
      .from('profiles')
      .update({
        balance: updatedBalance,
        holdings: updatedHoldings,
        net_profit: updatedNetProfit,
      })
      .eq('id', profileId)

    if (updateProfileError) {
      return res.status(400).json({ success: false, message: updateProfileError.message })
    }

    // 全部卖出 => 删除记录
    if (parsedVolume === existingItem.volume) {
      const { error: deleteError } = await db
        .from('portfolio_holdings')
        .delete()
        .eq('stock_id', parsedStockId)

      if (deleteError) {
        return res.status(400).json({ success: false, message: deleteError.message })
      }
    } else {
      // 部分卖出 => 更新 volume（avg_price 不变）
      const newVolume = existingItem.volume - parsedVolume

      const { error: updateHoldingError } = await db
        .from('portfolio_holdings')
        .update({ volume: newVolume })
        .eq('stock_id', parsedStockId)

      if (updateHoldingError) {
        return res.status(400).json({ success: false, message: updateHoldingError.message })
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Sell operation successful',
    })
  } catch (err) {
    console.error('Sell error:', err)
    return res.status(500).json({
      success: false,
      message: (err as Error).message || 'Unexpected server error',
    })
  }
})

export default router
