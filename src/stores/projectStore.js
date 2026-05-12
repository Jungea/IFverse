import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useProjectStore = create((set, get) => ({
  projects: [],
  loading: false,

  setProjects: (projects) => set({ projects }),
  removeProject: (id) => set({ projects: get().projects.filter((p) => p.id !== id) }),

  fetchProjects: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('projects').select('*').order('created_at', { ascending: false })
    set({ loading: false })
    if (!error) set({ projects: data })
  },

  createProject: async (title, description = '') => {
    const { data, error } = await supabase
      .from('projects').insert({ title, description }).select().single()
    if (!error) set({ projects: [data, ...get().projects] })
    return { data, error }
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) get().removeProject(id)
    return { error }
  },
}))
