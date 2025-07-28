import { Router } from 'express'

import { db } from '../db'

const router = Router()

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    })
  }

  const { data, error } = await db.auth.signUp({ email, password })

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.status(201).json({ success: true, data })
})

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    })
  }

  const { data, error } = await db.auth.signInWithPassword({ email, password })

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, data })
})

// POST /api/auth/signout
router.post('/signout', async (req, res) => {
  const { error } = await db.auth.signOut()

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, message: 'Signed out successfully' })
})

export default router
