import { Handle, Position } from '@xyflow/react'
import { useEditorStore } from '../../../stores/editorStore'

const TYPE_DEFAULTS = { scene: '#4f46e5', branch: '#7c3aed', ending: '#059669' }

export function getNodeColor(node, routes) {
  if (node.data.color) return node.data.color
  if (node.data.routeId) {
    const route = routes.find((r) => r.id === node.data.routeId)
    if (route) return route.color
  }
  return TYPE_DEFAULTS[node.data.nodeType] ?? '#4f46e5'
}

export default function StoryNode({ id, data, selected }) {
  const routes = useEditorStore((s) => s.routes)
  const setSelectedNodeId = useEditorStore((s) => s.setSelectedNodeId)
  const color = getNodeColor({ id, data }, routes)

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        background: '#1a1a2e',
        border: `2px solid ${color}`,
        borderRadius: '8px',
        padding: '10px 14px',
        minWidth: '130px',
        maxWidth: '200px',
        cursor: 'pointer',
        boxShadow: selected ? `0 0 0 2px ${color}55` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, width: 8, height: 8 }} />
      <div style={{ fontSize: '9px', color, fontWeight: '700', marginBottom: '4px', letterSpacing: '0.05em' }}>
        {data.nodeType.toUpperCase()}
      </div>
      <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600', lineHeight: 1.3 }}>
        {data.title}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 8, height: 8 }} />
    </div>
  )
}
