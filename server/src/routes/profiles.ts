import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

// GET /api/profiles/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, data })
})

// PUT /api/profiles/:id
router.put('/:id', async (req, res) => {
  const { username, full_name } = req.body

  const updates = {
    id: req.params.id,
    username,
    full_name,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await db.from('profiles').upsert(updates).select()

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, data: data[0] })
})

export default router
