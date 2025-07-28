import { Router } from 'express'

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
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search stocks by ticker or name
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
  // TODO: Implement stocks retrieval with pagination logic
  res.json({
    success: true,
    data: [],
    pagination: {
      total: 0,
      limit: 10,
      offset: 0,
      hasNext: false,
      hasPrev: false,
    },
  })
})

export default router
