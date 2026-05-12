import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEditorStore } from '../../stores/editorStore'
import RoutePanel from './RoutePanel'

export default function NodeSidebar() {
  const { nodes, edges, routes, projectId, selectedNodeId, updateNodeData, updateEdgeLabel, setSelectedNodeId } = useEditorStore()
  const node = nodes.find((n) => n.id === selectedNodeId)
  const [title, setTitle] = useState('')

  useEffect(() => { if (node) setTitle(node.data.title) }, [node?.id])

  // `content` handles initial mount; the effect below handles node switches
  // (useEditor does not re-initialize when selectedNodeId changes)
  const editor = useEditor({
    extensions: [StarterKit],
    content: node?.data.content ?? {},
    onUpdate: ({ editor }) => {
      if (node) updateNodeData(node.id, { content: editor.getJSON() })
    },
  })

  useEffect(() => {
    if (!editor || !node) return
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(node.data.content)) {
      editor.commands.setContent(node.data.content ?? {})
    }
  }, [node?.id])

  if (!node) return null

  const outgoingEdges = edges.filter((e) => e.source === node.id)

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700' }}>{node.data.nodeType.toUpperCase()}</span>
        <button onClick={() => setSelectedNodeId(null)} style={s.close}>✕</button>
      </div>

      {/* 제목 */}
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        onBlur={() => updateNodeData(node.id, { title })} style={s.titleInput} />

      {/* 타입 */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {['scene', 'branch', 'ending'].map((t) => (
          <button key={t} onClick={() => updateNodeData(node.id, { nodeType: t })}
            style={{ ...s.typeBtn, ...(node.data.nodeType === t ? s.activeType : {}) }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 루트 배정 */}
      <div>
        <div style={s.label}>세계선(루트)</div>
        <select value={node.data.routeId ?? ''}
          onChange={(e) => updateNodeData(node.id, { routeId: e.target.value || null })}
          style={s.select}>
          <option value="">미지정</option>
          {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {/* 색상 오버라이드 */}
      <div>
        <div style={s.label}>색상 오버라이드</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="color" value={node.data.color ?? '#4f46e5'}
            onChange={(e) => updateNodeData(node.id, { color: e.target.value })}
            style={{ width: '36px', height: '28px', border: 'none', background: 'none', cursor: 'pointer' }} />
          {node.data.color && (
            <button onClick={() => updateNodeData(node.id, { color: null })} style={s.clearBtn}>초기화</button>
          )}
        </div>
      </div>

      {/* Tiptap */}
      <div>
        <div style={s.label}>내용</div>
        {editor && (
          <div style={s.toolbar}>
            {[
              { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), style: { fontWeight: '700' } },
              { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), style: { fontStyle: 'italic' } },
              { label: 'H', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading') },
              { label: '≡', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
            ].map(({ label, action, active, style: extraStyle }) => (
              <button key={label} onClick={action}
                style={{ ...s.toolBtn, background: active ? '#7c3aed' : '#1a1a2e', ...extraStyle }}>
                {label}
              </button>
            ))}
          </div>
        )}
        <div style={s.editorArea}><EditorContent editor={editor} /></div>
      </div>

      {/* 나가는 선택지 */}
      {outgoingEdges.length > 0 && (
        <div>
          <div style={s.label}>나가는 선택지</div>
          {outgoingEdges.map((edge) => {
            const target = nodes.find((n) => n.id === edge.target)
            return (
              <div key={edge.id} style={s.edgeRow}>
                <span style={{ fontSize: '11px', color: '#888', flex: 1 }}>→ {target?.data.title ?? '?'}</span>
                <input placeholder="선택지 텍스트" value={edge.data?.label ?? ''}
                  onChange={(e) => updateEdgeLabel(edge.id, e.target.value)}
                  style={s.edgeLabelInput} />
              </div>
            )
          })}
        </div>
      )}
      {/* 세계선 관리 */}
      <div style={{ borderTop: '1px solid #222', paddingTop: '12px' }}>
        <RoutePanel projectId={node.data.projectId ?? projectId} />
      </div>
    </div>
  )
}

const s = {
  panel: { width: '260px', background: '#0f0f18', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', overflowY: 'auto', fontSize: '13px', flexShrink: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  close: { background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px' },
  titleInput: { width: '100%', background: '#0a0a14', border: '1px solid #333', borderRadius: '6px', padding: '6px 8px', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', outline: 'none' },
  typeBtn: { flex: 1, padding: '4px', background: '#1a1a2e', border: '1px solid #333', borderRadius: '4px', color: '#888', cursor: 'pointer', fontSize: '10px' },
  activeType: { background: '#7c3aed', color: '#fff', border: '1px solid #7c3aed' },
  label: { fontSize: '10px', color: '#555', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  select: { width: '100%', background: '#0a0a14', border: '1px solid #333', borderRadius: '6px', padding: '6px 8px', color: '#e2e8f0', fontSize: '12px', outline: 'none' },
  clearBtn: { background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#888', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' },
  toolbar: { display: 'flex', gap: '4px', marginBottom: '4px' },
  toolBtn: { border: '1px solid #333', borderRadius: '3px', padding: '2px 7px', color: '#aaa', cursor: 'pointer', fontSize: '12px' },
  editorArea: { background: '#0a0a14', border: '1px solid #333', borderRadius: '6px', padding: '8px', minHeight: '80px', color: '#e2e8f0', fontSize: '13px', lineHeight: 1.6 },
  edgeRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  edgeLabelInput: { width: '120px', background: '#0a0a14', border: '1px solid #333', borderRadius: '4px', padding: '3px 6px', color: '#e2e8f0', fontSize: '11px', outline: 'none' },
}
