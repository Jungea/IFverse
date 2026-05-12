import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '../../stores/editorStore'
import { applyAutoLayout } from '../../lib/autoLayout'

export default function EditorToolbar({ projectId, projectTitle }) {
  const { nodes, edges, addNode, saveStatus } = useEditorStore()
  const navigate = useNavigate()

  const handleAutoLayout = () => {
    const laid = applyAutoLayout(nodes, edges)
    useEditorStore.setState({ nodes: laid })
  }

  const handleAddNode = () => {
    addNode({ position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 }, projectId })
  }

  const saveLabel = { saved: '저장됨 ✓', saving: '저장 중...', error: '저장 실패 !' }[saveStatus]
  const saveColor = saveStatus === 'error' ? '#ef4444' : '#555'

  return (
    <div style={s.bar}>
      <button onClick={() => navigate('/dashboard')} style={s.back}>← 목록</button>
      <span style={s.title}>{projectTitle ?? '프로젝트'}</span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={handleAddNode} style={s.add}>+ 노드</button>
        <button onClick={handleAutoLayout} style={s.layout}>자동 정렬</button>
        <span style={{ fontSize: '12px', color: saveColor }}>{saveLabel}</span>
      </div>
    </div>
  )
}

const s = {
  bar: { height: '48px', background: '#111', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', flexShrink: 0 },
  back: { background: 'transparent', border: '1px solid #333', borderRadius: '5px', color: '#888', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' },
  title: { fontSize: '14px', fontWeight: '600', color: '#e2e8f0' },
  add: { background: '#7c3aed', border: 'none', borderRadius: '5px', color: '#fff', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  layout: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '5px', color: '#aaa', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' },
}
