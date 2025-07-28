import { Router } from 'express'

import { db } from '../db'

const router = Router()

/**
 * @swagger
 * /api/colors:
 *   get:
 *     summary: Get all colors
 *     tags: [Colors]
 *     responses:
 *       200:
 *         description: List of all colors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Color'
 *                 count:
 *                   type: number
 *                   example: 10
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// GET /api/colors
router.get('/', async (req, res) => {
  const { data, error } = await db
    .from('colors')
    .select('*')
    .order('id', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  res.json({ success: true, data, count: data?.length || 0 })
})

/**
 * @swagger
 * /api/colors/{id}:
 *   get:
 *     summary: Get a specific color by ID
 *     tags: [Colors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The color ID
 *     responses:
 *       200:
 *         description: Color retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Color'
 *       404:
 *         description: Color not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 */
// GET /api/colors/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await db
    .from('colors')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error)
    return res.status(404).json({ success: false, error: 'Color not found' })

  res.json({ success: true, data })
})

// POST /api/colors
router.post('/', async (req, res) => {
  const {
    name,
    hex,
    red,
    green,
    blue,
    hue,
    sat_hsl,
    light_hsl,
    sat_hsv,
    val_hsv,
    source,
  } = req.body

  if (!hex)
    return res.status(400).json({ success: false, error: 'hex is required' })

  const { data, error } = await db
    .from('colors')
    .insert({
      name,
      hex,
      red,
      green,
      blue,
      hue,
      sat_hsl,
      light_hsl,
      sat_hsv,
      val_hsv,
      source,
    })
    .select()

  if (error)
    return res.status(400).json({ success: false, error: error.message })

  res.status(201).json({ success: true, data: data[0] })
})

// PUT /api/colors/:id
router.put('/:id', async (req, res) => {
  const { data, error } = await db
    .from('colors')
    .update(req.body)
    .eq('id', req.params.id)
    .select()

  if (error)
    return res.status(400).json({ success: false, error: error.message })
  if (!data || data.length === 0)
    return res.status(404).json({ success: false, error: 'Color not found' })

  res.json({ success: true, data: data[0] })
})

// DELETE /api/colors/:id
router.delete('/:id', async (req, res) => {
  const { error } = await db.from('colors').delete().eq('id', req.params.id)

  if (error)
    return res.status(400).json({ success: false, error: error.message })

  res.json({ success: true, message: 'Color deleted successfully' })
})

export default router
