import { useEffect, useState } from 'react'

import type { User } from '@/types/database'
import api from '@/lib/api'

interface Session {
  user: User
  access_token: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const savedSession = localStorage.getItem('session')
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession)
      setSession(parsedSession)
      setUser(parsedSession.user)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password })
    const { session: newSession } = response.data.data

    setSession(newSession)
    setUser(newSession.user)
    localStorage.setItem('session', JSON.stringify(newSession))
    localStorage.setItem('token', newSession.access_token)

    return response
  }

  const signUp = async (email: string, password: string) => {
    return api.post('/auth/signup', { email, password })
  }

  const signOut = async () => {
    await api.post('/auth/signout')
    setUser(null)
    setSession(null)
    localStorage.removeItem('session')
    localStorage.removeItem('token')
  }

  return { user, session, signIn, signUp, signOut }
}
