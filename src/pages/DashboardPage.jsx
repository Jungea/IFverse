import { useEffect, useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'
import ProjectCard from '../components/dashboard/ProjectCard'
import NewProjectModal from '../components/dashboard/NewProjectModal'

export default function DashboardPage() {
  const { projects, loading, fetchProjects } = useProjectStore()
  const signOut = useAuthStore((s) => s.signOut)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchProjects() }, [fetchProjects])

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.logo}>IFverse</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowModal(true)} style={s.newBtn}>+ 새 프로젝트</button>
          <button onClick={signOut} style={s.signOut}>로그아웃</button>
        </div>
      </header>
      <main style={s.main}>
        {loading && <p style={{ color: '#666' }}>불러오는 중...</p>}
        {!loading && projects.length === 0 && (
          <div style={s.empty}>
            <p>프로젝트가 없어요.</p>
            <button onClick={() => setShowModal(true)} style={s.newBtn}>첫 프로젝트 만들기</button>
          </div>
        )}
        <div style={s.grid}>
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </main>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #222' },
  logo: { fontSize: '1.25rem', fontWeight: '800', color: '#7c3aed' },
  main: { flex: 1, padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '4rem', color: '#555' },
  newBtn: { padding: '8px 16px', background: '#7c3aed', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  signOut: { padding: '8px 16px', background: 'transparent', border: '1px solid #444', borderRadius: '6px', color: '#888', cursor: 'pointer', fontSize: '0.875rem' },
}
