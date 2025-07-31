// auth user from Supabase
export interface User {
  id: string // UUID
  email?: string
}

// profile
export interface Profile {
  id: string // UUID
  username: string
  avatar_url: string | null
  init_invest: number
  balance: number
  holdings: number
  net_profit: number
  created_at: string
  updated_at: string
}

// stocks
export interface Stock {
  id: number
  symbol: string
  name: string | null
  logo_id: string | null
  created_at: string
  updated_at: string
}

// stock_prices
export interface StockPrice {
  id: number
  stock_id: number
  date: string // YYYY-MM-DD
  price: number
  created_at: string
}

// portfolio_holdings
export interface PortfolioHolding {
  id: number
  stock_id: number
  volume: number
  avg_price: number
  created_at: string
  updated_at: string
}
