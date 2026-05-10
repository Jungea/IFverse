import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProjectStore } from '../../src/stores/projectStore'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: { id: 'p1', title: '테스트', description: '', created_at: new Date().toISOString() }, error: null }),
    })),
  },
}))

describe('projectStore', () => {
  beforeEach(() => useProjectStore.setState({ projects: [], loading: false }))

  it('초기 상태: 빈 배열', () => {
    expect(useProjectStore.getState().projects).toEqual([])
  })

  it('setProjects → 목록 설정', () => {
    useProjectStore.getState().setProjects([{ id: '1' }, { id: '2' }])
    expect(useProjectStore.getState().projects).toHaveLength(2)
  })

  it('removeProject → 항목 제거', () => {
    useProjectStore.setState({ projects: [{ id: '1' }, { id: '2' }] })
    useProjectStore.getState().removeProject('1')
    expect(useProjectStore.getState().projects).toEqual([{ id: '2' }])
  })
})
