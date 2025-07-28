import { useCallback, useEffect, useState } from 'react'

import type { Todo } from '@/types/database'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

import { Button } from './ui/button'

export function TodoComponent() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')

  const getTodos = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTodos(user!.id)

      if (!response.success) {
        throw new Error(response.error)
      }

      setTodos((response.data as Todo[]) || [])
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error loading todos')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      getTodos()
    }
  }, [user, getTodos])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newTask.length <= 3) {
      alert('Task must be longer than 3 characters')
      return
    }

    try {
      const response = await apiClient.createTodo(user!.id, newTask)

      if (!response.success) throw new Error(response.error)

      setNewTask('')
      getTodos()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error adding todo')
    }
  }

  const toggleTodo = async (id: number, is_complete: boolean) => {
    try {
      const response = await apiClient.updateTodo(id, !is_complete)

      if (!response.success) throw new Error(response.error)
      getTodos()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error updating todo')
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const response = await apiClient.deleteTodo(id)

      if (!response.success) throw new Error(response.error)
      getTodos()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error deleting todo')
    }
  }

  if (!user) return null

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-4 text-lg font-semibold">Todos</h3>

      <form onSubmit={addTodo} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 rounded border p-2"
            minLength={4}
            required
          />
          <Button type="submit">Add</Button>
        </div>
      </form>

      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <div className="space-y-2">
          {todos.length === 0 ? (
            <p className="text-gray-500">No todos yet. Add one above!</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-2 rounded border p-2"
              >
                <input
                  type="checkbox"
                  checked={todo.is_complete}
                  onChange={() => toggleTodo(todo.id, todo.is_complete)}
                />
                <span
                  className={
                    todo.is_complete ? 'text-gray-500 line-through' : ''
                  }
                >
                  {todo.task}
                </span>
                <Button
                  onClick={() => deleteTodo(todo.id)}
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
