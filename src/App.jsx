import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => init(), [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
