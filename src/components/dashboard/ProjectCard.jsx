import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../stores/projectStore'

export default function ProjectCard({ project }) {
  const navigate = useNavigate()
  const deleteProject = useProjectStore((s) => s.deleteProject)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`"${project.title}" 삭제할까요?`)) return
    await deleteProject(project.id)
  }

  return (
    <div onClick={() => navigate(`/project/${project.id}`)} style={s.card}>
      <div style={s.title}>{project.title}</div>
      {project.description && <div style={s.desc}>{project.description}</div>}
      <div style={s.footer}>
        <span style={s.date}>{new Date(project.created_at).toLocaleDateString('ko-KR')}</span>
        <button onClick={handleDelete} style={s.del}>삭제</button>
      </div>
    </div>
  )
}

const s = {
  card: { background: '#111', border: '1px solid #222', borderRadius: '10px', padding: '1.25rem', cursor: 'pointer' },
  title: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' },
  desc: { fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: '0.75rem', color: '#555' },
  del: { background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#888', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' },
}
