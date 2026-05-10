import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../stores/projectStore'

export default function NewProjectModal({ onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const createProject = useProjectStore((s) => s.createProject)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const { data, error } = await createProject(title.trim(), description.trim())
    setLoading(false)
    if (!error && data) navigate(`/project/${data.id}`)
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <form style={s.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>새 프로젝트</h2>
        <input autoFocus placeholder="프로젝트 제목" value={title}
          onChange={(e) => setTitle(e.target.value)} required style={s.input} />
        <textarea placeholder="설명 (선택)" value={description}
          onChange={(e) => setDescription(e.target.value)} rows={3}
          style={{ ...s.input, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={s.cancel}>취소</button>
          <button type="submit" disabled={loading || !title.trim()} style={s.create}>
            {loading ? '생성 중...' : '만들기'}
          </button>
        </div>
      </form>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '10px 12px', background: '#0a0a0f', border: '1px solid #333', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', width: '100%' },
  cancel: { padding: '8px 16px', background: 'transparent', border: '1px solid #444', borderRadius: '6px', color: '#888', cursor: 'pointer' },
  create: { padding: '8px 16px', background: '#7c3aed', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
}
