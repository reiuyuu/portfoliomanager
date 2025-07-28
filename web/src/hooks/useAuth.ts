import { useEffect, useState } from 'react'

import api, { setAuthToken } from '@/lib/api'

interface User {
  id: string
  email: string
}

interface Session {
  user: User
  access_token: string
}

interface SupabaseAuthResponse {
  session: Session | null
  user: User | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('session')
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession)
        setSession(parsedSession)
        setUser(parsedSession.user)
        setAuthToken(parsedSession.access_token)
      } catch {
        localStorage.removeItem('session')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password })

    if (response.data.data) {
      // Supabase returns { session, user } format
      const authData = response.data.data as SupabaseAuthResponse
      if (authData.session) {
        setSession(authData.session)
        setUser(authData.session.user)
        setAuthToken(authData.session.access_token)
        localStorage.setItem('session', JSON.stringify(authData.session))
      }
    }

    return response
  }

  const signUp = async (email: string, password: string) => {
    return api.post('/auth/signup', { email, password })
  }

  const signOut = async () => {
    const response = await api.post('/auth/signout')

    setSession(null)
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('session')

    return response
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
