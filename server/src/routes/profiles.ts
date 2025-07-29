import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

router.get('/', async (_req, res) => {
  const { data, error } = await db.from('profiles').select('*').single()

  if (error)
    return res.status(400).json({ success: false, error: error.message })

  res.json({ success: true, data })
})

export default router
