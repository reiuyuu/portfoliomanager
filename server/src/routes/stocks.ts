import { Router } from 'express'

import { db } from '../config/db'

const router = Router()
/**
 * @swagger
 * /api/stocks:
 *   get:
 *     summary: Get list of stocks with pagination
 *     description: Returns a paginated list of all stocks
 *     tags: [Stocks]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of stocks to return per page
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of items to skip before starting to collect the result set
 *     responses:
 *       200:
 *         description: Paginated list of stocks retrieved successfully
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
 *                     $ref: '#/components/schemas/StockItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of stocks available
 *                       example: 150
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// GET /api/stocks
router.get('/', async (req, res) => {
  try {
    // TODO: Implement stocks retrieval with pagination logic
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 10, 1),
      100,
    )
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0)

    let query = db
      .from('stocks')
      .select('id, symbol, name', { count: 'exact' })
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      console.error('Error querying stocks:', error)
      return res
        .status(500)
        .json({ success: false, message: 'Internal Server Error' })
    }

    const hasNext = count !== null ? offset + limit < count : false
    const hasPrev = offset > 0

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasNext,
        hasPrev,
      },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res
      .status(500)
      .json({ success: false, message: 'Unexpected Server Error' })
  }
})

export default router
