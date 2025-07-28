const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Auth methods
  async signUp(email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signIn(email: string, password: string) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signOut() {
    return this.request('/auth/signout', {
      method: 'POST',
    })
  }

  // Profile methods
  async getProfile(userId: string) {
    return this.request(`/profiles/${userId}`)
  }

  async updateProfile(
    userId: string,
    profile: { username?: string; full_name?: string },
  ) {
    return this.request(`/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    })
  }

  // Todo methods
  async getTodos(userId: string) {
    return this.request(`/todos?user_id=${userId}`)
  }

  async createTodo(userId: string, task: string) {
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, task }),
    })
  }

  async updateTodo(todoId: number, is_complete: boolean) {
    return this.request(`/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_complete }),
    })
  }

  async deleteTodo(todoId: number) {
    return this.request(`/todos/${todoId}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
