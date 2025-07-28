export interface Profile {
  id: string
  updated_at: string | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
}

export interface Todo {
  id: number
  user_id: string
  task: string
  is_complete: boolean
  inserted_at: string
}
