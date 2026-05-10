import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../../src/stores/editorStore'

const makeNode = (id) => ({
  id,
  type: 'storyNode',
  position: { x: 0, y: 0 },
  data: { title: 'Test', nodeType: 'scene', content: {}, color: null, routeId: null, projectId: 'p1' },
})

const makeEdge = (id, source, target) => ({
  id, source, target, type: 'labeledEdge', data: { label: '' },
})

describe('editorStore', () => {
  beforeEach(() =>
    useEditorStore.setState({ nodes: [], edges: [], routes: [], selectedNodeId: null, saveStatus: 'saved', projectId: null })
  )

  it('addNode — 노드 추가, 타입 기본값 scene', () => {
    useEditorStore.getState().addNode({ position: { x: 100, y: 200 }, projectId: 'p1' })
    const { nodes } = useEditorStore.getState()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].data.nodeType).toBe('scene')
    expect(nodes[0].position).toEqual({ x: 100, y: 200 })
  })

  it('deleteNode — 노드와 연결 엣지 모두 삭제', () => {
    useEditorStore.setState({ nodes: [makeNode('n1'), makeNode('n2')], edges: [makeEdge('e1', 'n1', 'n2')] })
    useEditorStore.getState().deleteNode('n1')
    expect(useEditorStore.getState().nodes).toHaveLength(1)
    expect(useEditorStore.getState().edges).toHaveLength(0)
  })

  it('updateNodeData — 특정 필드만 업데이트', () => {
    useEditorStore.setState({ nodes: [makeNode('n1')] })
    useEditorStore.getState().updateNodeData('n1', { title: '수정됨' })
    expect(useEditorStore.getState().nodes[0].data.title).toBe('수정됨')
    expect(useEditorStore.getState().nodes[0].data.nodeType).toBe('scene')
  })

  it('addRoute — 루트 추가', () => {
    useEditorStore.getState().addRoute({ name: '루트 A', color: '#3b82f6', projectId: 'p1' })
    expect(useEditorStore.getState().routes).toHaveLength(1)
    expect(useEditorStore.getState().routes[0].name).toBe('루트 A')
  })

  it('deleteRoute — 루트 삭제 시 소속 노드의 routeId null로', () => {
    useEditorStore.setState({
      routes: [{ id: 'r1', name: 'A', color: '#000', projectId: 'p1' }],
      nodes: [{ ...makeNode('n1'), data: { ...makeNode('n1').data, routeId: 'r1' } }],
    })
    useEditorStore.getState().deleteRoute('r1')
    expect(useEditorStore.getState().routes).toHaveLength(0)
    expect(useEditorStore.getState().nodes[0].data.routeId).toBeNull()
  })

  it('updateEdgeLabel — 라벨 업데이트', () => {
    useEditorStore.setState({ edges: [makeEdge('e1', 'n1', 'n2')] })
    useEditorStore.getState().updateEdgeLabel('e1', '선택지 A')
    expect(useEditorStore.getState().edges[0].data.label).toBe('선택지 A')
  })

  it('deleteNode — selectedNodeId가 삭제된 노드이면 null로', () => {
    useEditorStore.setState({ nodes: [makeNode('n1')], edges: [], selectedNodeId: 'n1' })
    useEditorStore.getState().deleteNode('n1')
    expect(useEditorStore.getState().selectedNodeId).toBeNull()
  })

  it('loadGraph — selectedNodeId와 saveStatus 초기화', () => {
    useEditorStore.setState({ selectedNodeId: 'n1', saveStatus: 'saving' })
    useEditorStore.getState().loadGraph({ projectId: 'p1', nodes: [], edges: [], routes: [] })
    const state = useEditorStore.getState()
    expect(state.selectedNodeId).toBeNull()
    expect(state.saveStatus).toBe('saved')
    expect(state.projectId).toBe('p1')
  })

  it('onConnect — labeledEdge 타입과 빈 라벨로 엣지 추가', () => {
    useEditorStore.setState({ edges: [] })
    useEditorStore.getState().onConnect({ source: 'n1', target: 'n2' })
    const { edges } = useEditorStore.getState()
    expect(edges).toHaveLength(1)
    expect(edges[0].type).toBe('labeledEdge')
    expect(edges[0].data.label).toBe('')
  })
})
