import { useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'

const PRESETS = ['#3b82f6', '#f97316', '#22c55e', '#ec4899', '#eab308', '#a855f7', '#06b6d4', '#ef4444']

export default function RoutePanel({ projectId }) {
  const { routes, addRoute, deleteRoute } = useEditorStore()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESETS[0])

  const handleAdd = () => {
    if (!name.trim()) return
    addRoute({ name: name.trim(), color, projectId })
    setName('')
    setColor(PRESETS[(routes.length + 1) % PRESETS.length])
    setAdding(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>세계선 관리</span>
        <button onClick={() => setAdding((v) => !v)}
          style={{ background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#888', width: '22px', height: '22px', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>
          +
        </button>
      </div>

      {adding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#0a0a14', border: '1px solid #333', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
          <input autoFocus placeholder="루트 이름" value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#e2e8f0', fontSize: '12px', padding: '2px 0', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {PRESETS.map((c) => (
              <div key={c} onClick={() => setColor(c)}
                style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, cursor: 'pointer', outline: color === c ? '2px solid #fff' : 'none', outlineOffset: '2px' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={handleAdd} style={{ background: '#7c3aed', border: 'none', borderRadius: '4px', color: '#fff', padding: '3px 10px', cursor: 'pointer', fontSize: '11px' }}>추가</button>
            <button onClick={() => setAdding(false)} style={{ background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#888', padding: '3px 10px', cursor: 'pointer', fontSize: '11px' }}>취소</button>
          </div>
        </div>
      )}

      {routes.length === 0 && !adding && (
        <p style={{ fontSize: '11px', color: '#555' }}>루트가 없어요. + 로 추가하세요.</p>
      )}

      {routes.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid #1a1a2e' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '12px', color: '#e2e8f0' }}>{r.name}</span>
          <button onClick={() => deleteRoute(r.id)} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
        </div>
      ))}
    </div>
  )
}
