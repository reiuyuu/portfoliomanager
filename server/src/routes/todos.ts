import { Router } from 'express'

import { db } from '../config/db.js'

const router = Router()

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

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  const { error } = await db.from('todos').delete().eq('id', req.params.id)

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  res.json({ success: true, message: 'Todo deleted successfully' })
})

export default router
