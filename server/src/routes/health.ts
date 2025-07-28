import { Router } from 'express'

const router = Router()

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     tags: [Health]
 *     operationId: healthCheck
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
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-29T10:30:00.000Z
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Manager API Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

export default router
