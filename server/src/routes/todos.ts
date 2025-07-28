import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos for a user
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to get todos for
 *     responses:
 *       200:
 *         description: List of todos retrieved successfully
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
 *                     $ref: '#/components/schemas/Todo'
 *                 count:
 *                   type: number
 *                   example: 5
 *       400:
 *         description: Bad request - user_id is required
 */
// GET /api/todos?user_id=xxx
router.get('/', async (req, res) => {
  const { user_id } = req.query

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: 'user_id is required',
    })
  }

  const { data, error } = await db
    .from('todos')
    .select('*')
    .eq('user_id', user_id)
    .order('inserted_at', { ascending: false })

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, data, count: data?.length || 0 })
})

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - task
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               task:
 *                 type: string
 *                 minLength: 4
 *                 example: "Complete the project documentation"
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad request - validation error
 */
// POST /api/todos
router.post('/', async (req, res) => {
  const { user_id, task } = req.body

  if (!user_id || !task) {
    return res.status(400).json({
      success: false,
      error: 'user_id and task are required',
    })
  }

  if (task.length <= 3) {
    return res.status(400).json({
      success: false,
      error: 'Task must be longer than 3 characters',
    })
  }

  const { data, error } = await db
    .from('todos')
    .insert([
      {
        user_id,
        task,
        is_complete: false,
      },
    ])
    .select()

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.status(201).json({ success: true, data: data[0] })
})

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update todo completion status
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_complete
 *             properties:
 *               is_complete:
 *                 type: boolean
 *                 description: Whether the todo is completed
 *                 example: true
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// PUT /api/todos/:id
router.put('/:id', async (req, res) => {
  const { is_complete } = req.body

  const { data, error } = await db
    .from('todos')
    .update({ is_complete })
    .eq('id', req.params.id)
    .select()

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ success: false, error: 'Todo not found' })
  }

  res.json({ success: true, data: data[0] })
})

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The todo ID to delete
 *     responses:
 *       200:
 *         description: Todo deleted successfully
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
 *                   example: Todo deleted successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 */
// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  const { error } = await db.from('todos').delete().eq('id', req.params.id)

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, message: 'Todo deleted successfully' })
})

export default router
