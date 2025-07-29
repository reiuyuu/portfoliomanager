import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

router.post('/signup', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await db.auth.signUp({ email, password })

  if (error) return res.json({ success: false, error: error.message })

  res.json({ success: true, data })
})

router.post('/signin', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await db.auth.signInWithPassword({ email, password })

  if (error) return res.json({ success: false, error: error.message })

  res.json({ success: true, data })
})

router.post('/signout', async (_req, res) => {
  const { error } = await db.auth.signOut()

  if (error) return res.json({ success: false, error: error.message })

  res.json({ success: true })
})

export default router
