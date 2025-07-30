// Test environment setup
process.env.NODE_ENV = 'test'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  })),
}

// Mock database config
jest.mock('../src/config/db', () => ({
  db: mockSupabaseClient,
}))

// Global test utilities and cleanup
global.mockDb = mockSupabaseClient

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})
