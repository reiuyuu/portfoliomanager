import { useAuth } from '@/hooks/useAuth'
import { AuthComponent } from '@/components/AuthComponent'
import StockChart from '@/components/StockChart'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-2xl font-bold">
          Portfolio Manager
        </h1>
        <div className="mx-auto max-w-4xl space-y-6">
          <AuthComponent />
          {user && <StockChart />}
        </div>
      </div>
    </div>
  )
}

export default App
