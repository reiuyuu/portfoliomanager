import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

// GET /api/profiles  返回唯一用户详细信息和计算结果
router.get('/', async (req, res) => {
  try {
    // 1. 取 profiles 表中第一个用户（只有一个）
    const { data: profiles, error: profileError } = await db
      .from('profiles')
      .select('*')
      .limit(1)

    if (profileError || !profiles || profiles.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const profile = profiles[0]

    // 2. 获取该用户所有持仓（portfolio_holdings 不区分用户）
    const { data: holdingsData, error: holdingsError } = await db
      .from('portfolio_holdings')
      .select('stock_id, volume')

    if (holdingsError) {
      return res
        .status(400)
        .json({ success: false, message: holdingsError.message })
    }

    // 3. 计算持仓总值
    let totalHoldings = 0
    for (const holding of holdingsData) {
      const { data: priceRow, error: priceError } = await db
        .from('stock_prices')
        .select('price')
        .eq('stock_id', holding.stock_id)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (priceError || !priceRow) continue

      totalHoldings += holding.volume * priceRow.price
    }

    // 4. 计算净利润
    const netProfit = profile.balance + totalHoldings - profile.init_invest

    // 5. 更新 profiles 表
    const { error: updateError } = await db
      .from('profiles')
      .update({
        holdings: totalHoldings,
        net_profit: netProfit,
      })
      .eq('id', profile.id)

    if (updateError) {
      return res
        .status(400)
        .json({ success: false, message: updateError.message })
    }

    // 6. 返回结果
    return res.status(200).json({
      success: true,
      data: {
        ...profile,
        holdings: totalHoldings,
        net_profit: netProfit,
      },
    })
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Server error' })
  }
})

export default router