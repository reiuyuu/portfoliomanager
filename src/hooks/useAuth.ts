import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { db } from '@/lib/db'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(async (_event, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    session,
    loading,
    signIn: (email: string, password: string) =>
      db.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) =>
      db.auth.signUp({ email, password }),
    signOut: () => db.auth.signOut(),
  }
}
