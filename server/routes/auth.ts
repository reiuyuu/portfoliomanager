import { Router } from 'express'

import { db } from '../db'

const router = Router()

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - validation error
 */
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

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - invalid credentials
 */
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

/**
 * @swagger
 * /api/auth/signout:
 *   post:
 *     summary: Sign out a user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User signed out successfully
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
 *                   example: Signed out successfully
 *       400:
 *         description: Bad request - sign out failed
 */
// POST /api/auth/signout
router.post('/signout', async (req, res) => {
  const { error } = await db.auth.signOut()

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, message: 'Signed out successfully' })
})

export default router
