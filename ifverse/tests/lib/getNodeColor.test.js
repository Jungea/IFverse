import { describe, it, expect } from 'vitest'
import { getNodeColor } from '../../src/components/editor/nodes/StoryNode'

const routes = [{ id: 'r1', color: '#3b82f6' }, { id: 'r2', color: '#f97316' }]

describe('getNodeColor', () => {
  it('개별 color 오버라이드 우선', () => {
    expect(getNodeColor({ data: { nodeType: 'scene', color: '#ff0000', routeId: 'r1' } }, routes)).toBe('#ff0000')
  })

  it('routeId 있으면 루트 색상', () => {
    expect(getNodeColor({ data: { nodeType: 'scene', color: null, routeId: 'r1' } }, routes)).toBe('#3b82f6')
  })

  it('둘 다 없으면 타입 기본값 — scene', () => {
    expect(getNodeColor({ data: { nodeType: 'scene', color: null, routeId: null } }, routes)).toBe('#4f46e5')
  })

  it('타입 기본값 — branch', () => {
    expect(getNodeColor({ data: { nodeType: 'branch', color: null, routeId: null } }, routes)).toBe('#7c3aed')
  })

  it('타입 기본값 — ending', () => {
    expect(getNodeColor({ data: { nodeType: 'ending', color: null, routeId: null } }, routes)).toBe('#059669')
  })
})
