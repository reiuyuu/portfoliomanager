// 测试环境的全局类型声明
declare global {
  var mockDb: {
    auth: {
      signUp: jest.Mock
      signInWithPassword: jest.Mock
      signOut: jest.Mock
    }
    from: jest.Mock
  }
}

export {}
