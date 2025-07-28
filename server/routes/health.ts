import { Router } from 'express'

const router = Router()

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Portfolio Manager API Server is running!
 */
router.get('/', (req, res) => {
  res.json({ message: 'Portfolio Manager API Server is running!' })
})

export default router
