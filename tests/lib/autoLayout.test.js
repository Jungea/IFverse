import { describe, it, expect } from 'vitest'
import { applyAutoLayout } from '../../src/lib/autoLayout'

const node = (id, x = 0, y = 0) => ({
  id, type: 'storyNode', position: { x, y }, width: 140, height: 60,
  data: { title: id, nodeType: 'scene', content: {}, color: null, routeId: null },
})

describe('applyAutoLayout', () => {
  it('단일 노드 — 위치 반환', () => {
    const result = applyAutoLayout([node('n1')], [])
    expect(result).toHaveLength(1)
    expect(typeof result[0].position.x).toBe('number')
  })

  it('부모 노드가 자식보다 위(y 작음)', () => {
    const result = applyAutoLayout([node('n1'), node('n2')], [{ id: 'e1', source: 'n1', target: 'n2' }])
    const n1 = result.find((n) => n.id === 'n1')
    const n2 = result.find((n) => n.id === 'n2')
    expect(n1.position.y).toBeLessThan(n2.position.y)
  })

  it('원본 배열 불변', () => {
    const nodes = [node('n1', 999, 999)]
    applyAutoLayout(nodes, [])
    expect(nodes[0].position.x).toBe(999)
  })
})
