import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

// 获取 profile 数据（如果今天还没更新过则自动更新）
router.get('/', async (_req, res) => {
  // 直接从数据库获取 profile 数据
  const { data: profiles, error: profileError } = await db
    .from('profiles')
    .select('*')
    .limit(1)

  if (profileError || !profiles || profiles.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  const profile = profiles[0]

  // 检查是否需要更新（如果今天还没更新过）
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const lastUpdated = profile.updated_at
    ? new Date(profile.updated_at).toISOString().split('T')[0]
    : null

  if (lastUpdated === today) {
    return res.status(200).json({ success: true, data: profile })
  }

  // 需要更新，执行日常计算逻辑
  const updatedProfile = await updateProfileData(profile)
  if (!updatedProfile) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update profile' })
  }

  return res.status(200).json({ success: true, data: updatedProfile })
})

// 每日更新 profile 数据的共用函数
async function updateProfileData(profile: any) {
  // 获取该用户所有持仓（portfolio_holdings 不区分用户）
  const { data: holdingsData, error: holdingsError } = await db
    .from('portfolio_holdings')
    .select('stock_id, volume, avg_price')

  if (holdingsError) {
    console.error('Error fetching holdings data:', holdingsError)
    return null
  }

  // 计算持仓总值
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

  // 计算净利润
  const netProfit = profile.balance + totalHoldings - profile.init_invest

  // 更新 profiles 表并直接返回更新后的数据
  const { data: updatedProfile, error: updateError } = await db
    .from('profiles')
    .update({ holdings: totalHoldings, net_profit: netProfit })
    .eq('id', profile.id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating profile:', updateError)
    return null
  }

  return updatedProfile
}

export default router
