import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The profile ID
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
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

export default router
