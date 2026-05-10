import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../../src/stores/authStore'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({}),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}))

describe('authStore', () => {
  beforeEach(() => useAuthStore.setState({ user: null, loading: true }))

  it('초기 상태: user null, loading true', () => {
    const { user, loading } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(loading).toBe(true)
  })

  it('setUser → user 설정, loading false', () => {
    useAuthStore.getState().setUser({ id: '123', email: 'a@b.com' })
    expect(useAuthStore.getState().user?.id).toBe('123')
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('signOut → user null', async () => {
    useAuthStore.setState({ user: { id: '123' }, loading: false })
    await useAuthStore.getState().signOut()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
