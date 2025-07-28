// 数据库表类型定义

export interface Profile {
  id: string
  updated_at: string | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  holdings: number | null
  balance: number | null
  net_profit: number | null
}

export interface Todo {
  id: number
  user_id: string
  task: string | null
  is_complete: boolean
  inserted_at: string
}
