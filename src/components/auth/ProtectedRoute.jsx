import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div style={{ padding: '2rem', color: '#555' }}>Loading...</div>
  if (!user) return <Navigate to="/" replace />
  return children
}
