import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import AuthForm from '../components/auth/AuthForm'

export default function LandingPage() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  useEffect(() => { if (!loading && user) navigate('/dashboard') }, [user, loading, navigate])
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <AuthForm />
    </div>
  )
}
