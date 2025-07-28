import { useState } from 'react'

import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'

export function AuthComponent() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSignUp) {
      const response = await signUp(email, password)
      if (!response.data.success) {
        alert(response.data.error)
        return
      }
      alert('Check your email for the confirmation link!')
    } else {
      const response = await signIn(email, password)
      if (!response.data.success) {
        alert(response.data.error)
      }
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>
  }

  if (user) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-semibold">Welcome!</h2>
        <p>Logged in as: {user.email}</p>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border p-2"
            required
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border p-2"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-blue-600 hover:underline"
        >
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </button>
      </form>
    </div>
  )
}
