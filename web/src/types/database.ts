// Database types based on PostgreSQL schema

// Auth types (from Supabase auth.users)
export interface User {
  id: string // UUID from auth.users
  email?: string
  // Add other auth fields as needed
}

// Profile table
export interface Profile {
  id: string // UUID, references auth.users(id)
  username: string
  avatar_url: string | null
  init_invest: number // Initial investment amount
  balance: number // Current balance
  holdings: number // Total value of stock holdings
  net_profit: number // Net profit/loss
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// Stocks table
export interface Stock {
  id: number // bigint
  symbol: string // Stock ticker symbol
  name: string | null // Company name
  created_at: string // ISO timestamp
}

// Stock prices table
export interface StockPrice {
  id: number // bigint
  stock_id: number // References stocks(id)
  date: string // Date in YYYY-MM-DD format
  price: number // Stock price
  created_at: string // ISO timestamp
}

// Portfolio holdings table
export interface PortfolioHolding {
  id: number // bigint
  stock_id: number // References stocks(id)
  volume: number // Number of shares owned
  avg_price: number // Average purchase price
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}
