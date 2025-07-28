import { AuthComponent } from './components/AuthComponent'
import { ProfileComponent } from './components/ProfileComponent'
import { TodoComponent } from './components/TodoComponent'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-2xl font-bold">
          Demo with Vite + React + Supabase + Vercel
        </h1>

        <div className="mx-auto max-w-4xl space-y-6">
          <AuthComponent />

          {user && (
            <div className="grid gap-6 md:grid-cols-2">
              <ProfileComponent />
              <TodoComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
