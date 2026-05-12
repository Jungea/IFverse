import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function AuthForm() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'confirm'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
      } else {
        setUser(data.user) // synchronous store update before navigate
        navigate('/dashboard')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
      } else if (!data.session) {
        setMode('confirm') // email confirmation required
      } else {
        setUser(data.user) // auto-confirmed
        navigate('/dashboard')
      }
    }
  }

  if (mode === 'confirm') {
    return (
      <div style={{ ...styles.form, textAlign: 'center', gap: '16px' }}>
        <h1 style={styles.logo}>IFverse</h1>
        <p style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: '600' }}>이메일을 확인해주세요</p>
        <p style={{ color: '#888', fontSize: '0.875rem', lineHeight: 1.6 }}>
          <strong style={{ color: '#e2e8f0' }}>{email}</strong>로<br />
          인증 링크를 보냈습니다.<br />
          링크를 클릭하면 자동으로 로그인됩니다.
        </p>
        <button type="button" onClick={() => setMode('login')} style={styles.submit}>
          로그인 화면으로
        </button>
      </div>
    )
  }

  const s = styles
  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <h1 style={s.logo}>IFverse</h1>
      <p style={s.tagline}>모든 IF를 연결하다</p>
      <div style={s.tabs}>
        {['login', 'signup'].map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            style={{ ...s.tab, ...(mode === m ? s.activeTab : {}) }}>
            {m === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>
      <input type="email" placeholder="이메일" value={email}
        onChange={(e) => setEmail(e.target.value)} required style={s.input} />
      <input type="password" placeholder="비밀번호 (6자 이상)" value={password}
        onChange={(e) => setPassword(e.target.value)} required minLength={6} style={s.input} />
      {error && <p style={s.error}>{error}</p>}
      <button type="submit" disabled={loading}
        style={{ ...s.submit, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
      </button>
    </form>
  )
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '360px' },
  logo: { fontSize: '2rem', fontWeight: '800', color: '#7c3aed', textAlign: 'center' },
  tagline: { fontSize: '0.875rem', color: '#666', textAlign: 'center', marginBottom: '8px' },
  tabs: { display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' },
  tab: { flex: 1, padding: '8px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.875rem' },
  activeTab: { background: '#7c3aed', color: '#fff' },
  input: { padding: '10px 12px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none' },
  error: { fontSize: '0.8rem', color: '#ef4444' },
  submit: { padding: '10px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600' },
}
