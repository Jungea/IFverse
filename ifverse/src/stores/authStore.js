import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  init: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, loading: false })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      set({ user: session?.user ?? null, loading: false })
    })
    return () => subscription.unsubscribe()
  },
}))
