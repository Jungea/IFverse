import { useParams } from 'react-router-dom'
import { useEditorStore } from '../stores/editorStore'
import GraphCanvas from '../components/editor/GraphCanvas'

export default function EditorPage() {
  const { id } = useParams()
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ height: '48px', background: '#111', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
        <span style={{ color: '#7c3aed', fontWeight: '700' }}>IFverse</span>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <GraphCanvas projectId={id} />
      </div>
    </div>
  )
}
