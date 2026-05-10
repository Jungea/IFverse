# IFverse MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** IFverse MVP 구현 — 스토리 분기/세계선 관리 PWA (로그인 + 프로젝트 관리 + 그래프 에디터 + 자동저장)

**Architecture:** React SPA가 Supabase JS SDK로 직접 통신 (별도 백엔드 없음). React Flow로 그래프 캔버스, Tiptap으로 노드 내 리치 텍스트, Zustand로 클라이언트 상태. Supabase RLS로 사용자별 데이터 격리.

**Tech Stack:** React 18 + Vite, @xyflow/react, @tiptap/react + @tiptap/starter-kit, Zustand, nanoid, @supabase/supabase-js, react-router-dom v6, dagre, vite-plugin-pwa, Vitest + @testing-library/react

---

## File Structure

```
ifverse/
├── public/
│   └── icons/                        ← PWA 아이콘 (Task 14)
├── src/
│   ├── main.jsx
│   ├── App.jsx                        ← Router + Auth 초기화
│   ├── lib/
│   │   ├── supabase.js               ← Supabase 클라이언트 싱글톤
│   │   └── autoLayout.js             ← dagre 자동 레이아웃 순수 함수
│   ├── stores/
│   │   ├── authStore.js              ← user, loading, init, signOut
│   │   ├── projectStore.js           ← projects[], fetch/create/delete
│   │   └── editorStore.js            ← nodes, edges, routes, selectedNodeId, saveStatus
│   ├── hooks/
│   │   └── useAutoSave.js            ← 디바운스 자동저장 훅
│   ├── pages/
│   │   ├── LandingPage.jsx           ← /
│   │   ├── DashboardPage.jsx         ← /dashboard
│   │   └── EditorPage.jsx            ← /project/:id (데이터 로드 + 저장 조율)
│   └── components/
│       ├── auth/
│       │   ├── AuthForm.jsx          ← 로그인/회원가입 폼
│       │   └── ProtectedRoute.jsx    ← 인증 가드
│       ├── dashboard/
│       │   ├── ProjectCard.jsx
│       │   └── NewProjectModal.jsx
│       └── editor/
│           ├── EditorToolbar.jsx     ← 상단 툴바
│           ├── GraphCanvas.jsx       ← React Flow 래퍼
│           ├── NodeSidebar.jsx       ← 우측 패널
│           ├── RoutePanel.jsx        ← 세계선 관리 (NodeSidebar 내부)
│           ├── nodes/
│           │   └── StoryNode.jsx     ← 커스텀 노드 + getNodeColor export
│           └── edges/
│               └── LabeledEdge.jsx  ← 라벨 있는 연결선
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── tests/
│   ├── setup.js
│   ├── lib/
│   │   ├── autoLayout.test.js
│   │   └── getNodeColor.test.js
│   ├── stores/
│   │   ├── authStore.test.js
│   │   ├── projectStore.test.js
│   │   └── editorStore.test.js
│   └── hooks/
│       └── useAutoSave.test.js
├── .env.local
└── vite.config.js
```

---

### Task 1: 프로젝트 초기화 + 테스트 환경

**Files:**
- Create: `ifverse/` (전체 프로젝트)
- Modify: `vite.config.js`
- Create: `tests/setup.js`, `.env.local`, `.gitignore`

- [ ] **Step 1: Vite 프로젝트 생성 및 의존성 설치**

```bash
npm create vite@latest ifverse -- --template react
cd ifverse
npm install @xyflow/react @tiptap/react @tiptap/starter-kit @supabase/supabase-js zustand nanoid react-router-dom dagre
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Vitest 설정**

`vite.config.js` 전체 교체:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
})
```

- [ ] **Step 3: 테스트 setup 파일**

`tests/setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: 환경변수 파일 생성**

`.env.local` (실제 값은 Supabase 대시보드에서 복사):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 5: .gitignore에 .env.local 포함 확인**

```bash
grep "env.local" .gitignore || echo ".env.local" >> .gitignore
```

- [ ] **Step 6: 보일러플레이트 정리**

```bash
rm src/assets/react.svg public/vite.svg src/App.css
```

`src/index.css` 전체 교체:

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #0a0a0f; color: #e2e8f0; }
.ProseMirror { outline: none; }
.ProseMirror p { margin: 0 0 0.5em; }
.ProseMirror h2 { font-size: 1.1rem; margin: 0.5em 0 0.25em; }
.ProseMirror ul { padding-left: 1.25em; }
```

`src/App.jsx`:

```jsx
export default function App() {
  return <div>IFverse</div>
}
```

- [ ] **Step 7: dev 서버 실행 확인**

```bash
npm run dev
```

Expected: `http://localhost:5173` 에서 "IFverse" 텍스트.

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: project setup with Vite, React, Vitest"
```

---

### Task 2: Supabase 스키마 + 클라이언트

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `src/lib/supabase.js`

- [ ] **Step 1: Supabase 프로젝트 생성**

1. https://supabase.com → New Project
2. Settings → API → `Project URL`, `anon public` 키 복사
3. `.env.local` 실제 값으로 교체

- [ ] **Step 2: 마이그레이션 SQL 작성**

`supabase/migrations/001_initial.sql`:

```sql
create extension if not exists "uuid-ossp";

create table projects (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users not null,
  title       text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table routes (
  id          uuid default uuid_generate_v4() primary key,
  project_id  uuid references projects on delete cascade not null,
  name        text not null,
  color       text not null default '#4f46e5',
  created_at  timestamptz default now()
);

create table nodes (
  id          uuid default uuid_generate_v4() primary key,
  project_id  uuid references projects on delete cascade not null,
  route_id    uuid references routes on delete set null,
  type        text not null default 'scene' check (type in ('scene', 'branch', 'ending')),
  title       text not null default 'New Scene',
  content     jsonb default '{}',
  color       text,
  position_x  float not null default 0,
  position_y  float not null default 0,
  created_at  timestamptz default now()
);

create table edges (
  id              uuid default uuid_generate_v4() primary key,
  project_id      uuid references projects on delete cascade not null,
  source_node_id  uuid references nodes on delete cascade not null,
  target_node_id  uuid references nodes on delete cascade not null,
  label           text,
  created_at      timestamptz default now()
);

alter table projects enable row level security;
alter table routes  enable row level security;
alter table nodes   enable row level security;
alter table edges   enable row level security;

create policy "own projects" on projects for all using (auth.uid() = user_id);
create policy "own routes"   on routes   for all using (project_id in (select id from projects where user_id = auth.uid()));
create policy "own nodes"    on nodes    for all using (project_id in (select id from projects where user_id = auth.uid()));
create policy "own edges"    on edges    for all using (project_id in (select id from projects where user_id = auth.uid()));
```

- [ ] **Step 3: Supabase 대시보드 SQL Editor에서 실행**

위 SQL 전체를 붙여넣고 Run. Expected: 에러 없이 완료.

- [ ] **Step 4: Supabase 클라이언트**

`src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) throw new Error('Missing Supabase env vars in .env.local')

export const supabase = createClient(url, key)
```

- [ ] **Step 5: 커밋**

```bash
git add supabase/ src/lib/supabase.js
git commit -m "feat: supabase schema and client"
```

---

### Task 3: Auth Store + App Router

**Files:**
- Create: `src/stores/authStore.js`
- Create: `src/components/auth/ProtectedRoute.jsx`
- Create: `src/pages/LandingPage.jsx`, `DashboardPage.jsx`, `EditorPage.jsx` (플레이스홀더)
- Modify: `src/App.jsx`, `src/main.jsx`
- Create: `tests/stores/authStore.test.js`

- [ ] **Step 1: authStore 테스트 작성**

`tests/stores/authStore.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../../src/stores/authStore'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({}),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}))

describe('authStore', () => {
  beforeEach(() => useAuthStore.setState({ user: null, loading: true }))

  it('초기 상태: user null, loading true', () => {
    const { user, loading } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(loading).toBe(true)
  })

  it('setUser → user 설정, loading false', () => {
    useAuthStore.getState().setUser({ id: '123', email: 'a@b.com' })
    expect(useAuthStore.getState().user?.id).toBe('123')
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('signOut → user null', async () => {
    useAuthStore.setState({ user: { id: '123' }, loading: false })
    await useAuthStore.getState().signOut()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- --run tests/stores/authStore.test.js
```

Expected: FAIL — `authStore` 없음

- [ ] **Step 3: authStore 구현**

`src/stores/authStore.js`:

```js
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  init: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, loading: false })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      set({ user: session?.user ?? null, loading: false })
    })
    return () => subscription.unsubscribe()
  },
}))
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- --run tests/stores/authStore.test.js
```

Expected: PASS (3 tests)

- [ ] **Step 5: ProtectedRoute**

`src/components/auth/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div style={{ padding: '2rem', color: '#555' }}>Loading...</div>
  if (!user) return <Navigate to="/" replace />
  return children
}
```

- [ ] **Step 6: 페이지 플레이스홀더 생성**

`src/pages/LandingPage.jsx`:
```jsx
export default function LandingPage() { return <div>Landing</div> }
```

`src/pages/DashboardPage.jsx`:
```jsx
export default function DashboardPage() { return <div>Dashboard</div> }
```

`src/pages/EditorPage.jsx`:
```jsx
export default function EditorPage() { return <div>Editor</div> }
```

- [ ] **Step 7: App.jsx — Router 구성**

`src/App.jsx`:

```jsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => init(), [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 8: main.jsx — App 마운트**

`src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
)
```

- [ ] **Step 9: 커밋**

```bash
git add src/
git commit -m "feat: auth store and app router with protected routes"
```

---

### Task 4: Auth UI — LandingPage

**Files:**
- Create: `src/components/auth/AuthForm.jsx`
- Modify: `src/pages/LandingPage.jsx`

- [ ] **Step 1: AuthForm 작성**

`src/components/auth/AuthForm.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AuthForm() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/dashboard')
  }

  const s = styles
  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <h1 style={s.logo}>IFverse</h1>
      <p style={s.tagline}>모든 IF를 연결하다</p>
      <div style={s.tabs}>
        {['login', 'signup'].map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            style={{ ...s.tab, ...(mode === m ? s.activeTab : {}) }}>
            {m === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>
      <input type="email" placeholder="이메일" value={email}
        onChange={(e) => setEmail(e.target.value)} required style={s.input} />
      <input type="password" placeholder="비밀번호 (6자 이상)" value={password}
        onChange={(e) => setPassword(e.target.value)} required minLength={6} style={s.input} />
      {error && <p style={s.error}>{error}</p>}
      <button type="submit" disabled={loading} style={s.submit}>
        {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
      </button>
    </form>
  )
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '360px' },
  logo: { fontSize: '2rem', fontWeight: '800', color: '#7c3aed', textAlign: 'center' },
  tagline: { fontSize: '0.875rem', color: '#666', textAlign: 'center', marginBottom: '8px' },
  tabs: { display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' },
  tab: { flex: 1, padding: '8px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.875rem' },
  activeTab: { background: '#7c3aed', color: '#fff' },
  input: { padding: '10px 12px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none' },
  error: { fontSize: '0.8rem', color: '#ef4444' },
  submit: { padding: '10px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
}
```

- [ ] **Step 2: LandingPage 완성**

`src/pages/LandingPage.jsx`:

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import AuthForm from '../components/auth/AuthForm'

export default function LandingPage() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  useEffect(() => { if (!loading && user) navigate('/dashboard') }, [user, loading, navigate])
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <AuthForm />
    </div>
  )
}
```

- [ ] **Step 3: 브라우저 확인**

```bash
npm run dev
```

- 회원가입 → `/dashboard` 이동
- 잘못된 비밀번호 → 에러 메시지
- 로그인 상태로 `/` 접속 → `/dashboard` 리다이렉트

- [ ] **Step 4: 커밋**

```bash
git add src/components/auth/AuthForm.jsx src/pages/LandingPage.jsx
git commit -m "feat: auth UI with login/signup form"
```

---

### Task 5: Project Store + Dashboard

**Files:**
- Create: `src/stores/projectStore.js`
- Create: `src/components/dashboard/ProjectCard.jsx`
- Create: `src/components/dashboard/NewProjectModal.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Create: `tests/stores/projectStore.test.js`

- [ ] **Step 1: projectStore 테스트**

`tests/stores/projectStore.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProjectStore } from '../../src/stores/projectStore'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: { id: 'p1', title: '테스트', description: '', created_at: new Date().toISOString() }, error: null }),
    })),
  },
}))

describe('projectStore', () => {
  beforeEach(() => useProjectStore.setState({ projects: [], loading: false }))

  it('초기 상태: 빈 배열', () => {
    expect(useProjectStore.getState().projects).toEqual([])
  })

  it('setProjects → 목록 설정', () => {
    useProjectStore.getState().setProjects([{ id: '1' }, { id: '2' }])
    expect(useProjectStore.getState().projects).toHaveLength(2)
  })

  it('removeProject → 항목 제거', () => {
    useProjectStore.setState({ projects: [{ id: '1' }, { id: '2' }] })
    useProjectStore.getState().removeProject('1')
    expect(useProjectStore.getState().projects).toEqual([{ id: '2' }])
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- --run tests/stores/projectStore.test.js
```

Expected: FAIL

- [ ] **Step 3: projectStore 구현**

`src/stores/projectStore.js`:

```js
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useProjectStore = create((set, get) => ({
  projects: [],
  loading: false,

  setProjects: (projects) => set({ projects }),
  removeProject: (id) => set({ projects: get().projects.filter((p) => p.id !== id) }),

  fetchProjects: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('projects').select('*').order('created_at', { ascending: false })
    set({ loading: false })
    if (!error) set({ projects: data })
  },

  createProject: async (title, description = '') => {
    const { data, error } = await supabase
      .from('projects').insert({ title, description }).select().single()
    if (!error) set({ projects: [data, ...get().projects] })
    return { data, error }
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) get().removeProject(id)
    return { error }
  },
}))
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- --run tests/stores/projectStore.test.js
```

Expected: PASS (3 tests)

- [ ] **Step 5: ProjectCard**

`src/components/dashboard/ProjectCard.jsx`:

```jsx
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
```

- [ ] **Step 6: NewProjectModal**

`src/components/dashboard/NewProjectModal.jsx`:

```jsx
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
```

- [ ] **Step 7: DashboardPage 완성**

`src/pages/DashboardPage.jsx`:

```jsx
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
```

- [ ] **Step 8: 브라우저 확인**

- 프로젝트 목록, 생성, 삭제 동작 확인

- [ ] **Step 9: 커밋**

```bash
git add src/stores/projectStore.js src/components/dashboard/ src/pages/DashboardPage.jsx tests/stores/projectStore.test.js
git commit -m "feat: project store and dashboard"
```

---

### Task 6: Editor Store

**Files:**
- Create: `src/stores/editorStore.js`
- Create: `tests/stores/editorStore.test.js`

- [ ] **Step 1: editorStore 테스트 작성**

`tests/stores/editorStore.test.js`:

```js
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
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- --run tests/stores/editorStore.test.js
```

Expected: FAIL

- [ ] **Step 3: editorStore 구현**

`src/stores/editorStore.js`:

```js
import { create } from 'zustand'
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import { nanoid } from 'nanoid'

export const useEditorStore = create((set, get) => ({
  projectId: null,
  nodes: [],
  edges: [],
  routes: [],
  selectedNodeId: null,
  saveStatus: 'saved', // 'saved' | 'saving' | 'error'

  setProjectId: (id) => set({ projectId: id }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => set({
    edges: addEdge({ ...connection, id: nanoid(), type: 'labeledEdge', data: { label: '' } }, get().edges),
  }),

  addNode: ({ position, projectId }) => {
    const node = {
      id: nanoid(),
      type: 'storyNode',
      position,
      data: { title: 'New Scene', nodeType: 'scene', content: {}, color: null, routeId: null, projectId },
    }
    set({ nodes: [...get().nodes, node] })
    return node
  },

  deleteNode: (nodeId) => set({
    nodes: get().nodes.filter((n) => n.id !== nodeId),
    edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
  }),

  updateNodeData: (nodeId, patch) => set({
    nodes: get().nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n),
  }),

  updateNodePosition: (nodeId, position) => set({
    nodes: get().nodes.map((n) => n.id === nodeId ? { ...n, position } : n),
  }),

  updateEdgeLabel: (edgeId, label) => set({
    edges: get().edges.map((e) => e.id === edgeId ? { ...e, data: { ...e.data, label } } : e),
  }),

  addRoute: ({ name, color, projectId }) => {
    const route = { id: nanoid(), name, color, projectId }
    set({ routes: [...get().routes, route] })
    return route
  },

  deleteRoute: (routeId) => set({
    routes: get().routes.filter((r) => r.id !== routeId),
    nodes: get().nodes.map((n) =>
      n.data.routeId === routeId ? { ...n, data: { ...n.data, routeId: null } } : n
    ),
  }),

  loadGraph: ({ projectId, nodes, edges, routes }) =>
    set({ projectId, nodes, edges, routes, selectedNodeId: null, saveStatus: 'saved' }),
}))
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- --run tests/stores/editorStore.test.js
```

Expected: PASS (6 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/stores/editorStore.js tests/stores/editorStore.test.js
git commit -m "feat: editor store with nodes, edges, routes"
```

---

### Task 7: 커스텀 노드 + 색상 시스템

**Files:**
- Create: `src/components/editor/nodes/StoryNode.jsx`
- Create: `src/components/editor/edges/LabeledEdge.jsx`
- Create: `tests/lib/getNodeColor.test.js`

- [ ] **Step 1: getNodeColor 테스트**

`tests/lib/getNodeColor.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { getNodeColor } from '../../src/components/editor/nodes/StoryNode'

const routes = [{ id: 'r1', color: '#3b82f6' }, { id: 'r2', color: '#f97316' }]

describe('getNodeColor', () => {
  it('개별 color 오버라이드 우선', () => {
    expect(getNodeColor({ data: { nodeType: 'scene', color: '#ff0000', routeId: 'r1' } }, routes)).toBe('#ff0000')
  })

  it('routeId 있으면 루트 색상', () => {
    expect(getNodeColor({ data: { nodeType: 'scene', color: null, routeId: 'r1' } }, routes)).toBe('#3b82f6')
  })

  it('둘 다 없으면 타입 기본값 — scene', () => {
    expect(getNodeColor({ data: { nodeType: 'scene', color: null, routeId: null } }, routes)).toBe('#4f46e5')
  })

  it('타입 기본값 — branch', () => {
    expect(getNodeColor({ data: { nodeType: 'branch', color: null, routeId: null } }, routes)).toBe('#7c3aed')
  })

  it('타입 기본값 — ending', () => {
    expect(getNodeColor({ data: { nodeType: 'ending', color: null, routeId: null } }, routes)).toBe('#059669')
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- --run tests/lib/getNodeColor.test.js
```

Expected: FAIL

- [ ] **Step 3: StoryNode + getNodeColor 구현**

`src/components/editor/nodes/StoryNode.jsx`:

```jsx
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
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- --run tests/lib/getNodeColor.test.js
```

Expected: PASS (5 tests)

- [ ] **Step 5: LabeledEdge 작성**

`src/components/editor/edges/LabeledEdge.jsx`:

```jsx
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'

export default function LabeledEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: '#444', strokeWidth: 2 }} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '11px',
            color: '#aaa',
            pointerEvents: 'none',
          }}>
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
```

- [ ] **Step 6: 커밋**

```bash
git add src/components/editor/nodes/ src/components/editor/edges/ tests/lib/getNodeColor.test.js
git commit -m "feat: custom StoryNode, LabeledEdge, and getNodeColor"
```

---

### Task 8: Graph Canvas

**Files:**
- Create: `src/components/editor/GraphCanvas.jsx`
- Modify: `src/pages/EditorPage.jsx` (캔버스 마운트)

- [ ] **Step 1: GraphCanvas 작성**

`src/components/editor/GraphCanvas.jsx`:

```jsx
import { useCallback } from 'react'
import { ReactFlow, Background, Controls, MiniMap, MarkerType } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '../../stores/editorStore'
import StoryNode from './nodes/StoryNode'
import LabeledEdge from './edges/LabeledEdge'

const nodeTypes = { storyNode: StoryNode }
const edgeTypes = { labeledEdge: LabeledEdge }
const defaultEdgeOptions = {
  type: 'labeledEdge',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
}

export default function GraphCanvas({ projectId }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } = useEditorStore()

  const handleDoubleClick = useCallback((e) => {
    const bounds = e.currentTarget.getBoundingClientRect()
    addNode({ position: { x: e.clientX - bounds.left - 65, y: e.clientY - bounds.top - 30 }, projectId })
  }, [addNode, projectId])

  return (
    <div style={{ flex: 1, height: '100%' }} onDoubleClick={handleDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        deleteKeyCode="Delete"
      >
        <Background color="#1a1a2e" gap={20} size={1} />
        <Controls style={{ background: '#111', border: '1px solid #333' }} />
        <MiniMap
          style={{ background: '#111', border: '1px solid #333' }}
          nodeColor={(n) => n.data?.color ?? '#4f46e5'}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  )
}
```

- [ ] **Step 2: EditorPage에 GraphCanvas 마운트**

`src/pages/EditorPage.jsx`:

```jsx
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
```

- [ ] **Step 3: 브라우저 확인**

- 캔버스 더블클릭 → 노드 추가
- 노드 핸들 드래그 → 연결선 생성
- 노드/엣지 선택 후 Delete 키 → 삭제
- 미니맵, 줌 컨트롤 동작

- [ ] **Step 4: 커밋**

```bash
git add src/components/editor/GraphCanvas.jsx src/pages/EditorPage.jsx
git commit -m "feat: React Flow graph canvas with add/connect/delete"
```

---

### Task 9: Node Sidebar + Tiptap

**Files:**
- Create: `src/components/editor/NodeSidebar.jsx`
- Modify: `src/pages/EditorPage.jsx`

- [ ] **Step 1: NodeSidebar 작성**

`src/components/editor/NodeSidebar.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEditorStore } from '../../stores/editorStore'

export default function NodeSidebar() {
  const { nodes, edges, routes, selectedNodeId, updateNodeData, updateEdgeLabel, setSelectedNodeId } = useEditorStore()
  const node = nodes.find((n) => n.id === selectedNodeId)
  const [title, setTitle] = useState('')

  useEffect(() => { if (node) setTitle(node.data.title) }, [node?.id])

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
```

- [ ] **Step 2: EditorPage에 NodeSidebar 추가**

`src/pages/EditorPage.jsx` 의 에디터 영역 수정:

```jsx
import { useParams } from 'react-router-dom'
import { useEditorStore } from '../stores/editorStore'
import GraphCanvas from '../components/editor/GraphCanvas'
import NodeSidebar from '../components/editor/NodeSidebar'

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
        {selectedNodeId && <NodeSidebar />}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 브라우저 확인**

- 노드 클릭 → 우측 패널 열림
- 제목 수정 → 노드에 즉시 반영
- 타입 변경 → 노드 색상 변경
- Bold/Italic/Heading/목록 동작
- 연결선 생성 후 선택지 텍스트 입력 → 엣지에 라벨 표시

- [ ] **Step 4: 커밋**

```bash
git add src/components/editor/NodeSidebar.jsx src/pages/EditorPage.jsx
git commit -m "feat: node sidebar with Tiptap editor and edge labels"
```

---

### Task 10: Auto Layout (dagre)

**Files:**
- Create: `src/lib/autoLayout.js`
- Create: `tests/lib/autoLayout.test.js`

- [ ] **Step 1: autoLayout 테스트**

`tests/lib/autoLayout.test.js`:

```js
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
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- --run tests/lib/autoLayout.test.js
```

Expected: FAIL

- [ ] **Step 3: autoLayout 구현**

`src/lib/autoLayout.js`:

```js
import dagre from 'dagre'

const NODE_W = 140
const NODE_H = 60

export function applyAutoLayout(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((n) => g.setNode(n.id, { width: n.width ?? NODE_W, height: n.height ?? NODE_H }))
  edges.forEach((e) => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map((n) => {
    const { x, y } = g.node(n.id)
    return { ...n, position: { x: x - (n.width ?? NODE_W) / 2, y: y - (n.height ?? NODE_H) / 2 } }
  })
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- --run tests/lib/autoLayout.test.js
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/autoLayout.js tests/lib/autoLayout.test.js
git commit -m "feat: dagre auto layout"
```

---

### Task 11: Route 관리 UI + EditorToolbar

**Files:**
- Create: `src/components/editor/RoutePanel.jsx`
- Create: `src/components/editor/EditorToolbar.jsx`
- Modify: `src/components/editor/NodeSidebar.jsx`
- Modify: `src/pages/EditorPage.jsx`

- [ ] **Step 1: RoutePanel 작성**

`src/components/editor/RoutePanel.jsx`:

```jsx
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
    setColor(PRESETS[routes.length % PRESETS.length])
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
```

- [ ] **Step 2: NodeSidebar 하단에 RoutePanel 추가**

`src/components/editor/NodeSidebar.jsx` 상단 import에 추가:

```jsx
import RoutePanel from './RoutePanel'
```

`src/components/editor/NodeSidebar.jsx` 의 마지막 `</div>` (panel 닫는 태그) 바로 전에 추가:

```jsx
{/* 세계선 관리 */}
<div style={{ borderTop: '1px solid #222', paddingTop: '12px' }}>
  <RoutePanel projectId={node.data.projectId} />
</div>
```

- [ ] **Step 3: EditorToolbar 작성**

`src/components/editor/EditorToolbar.jsx`:

```jsx
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
```

- [ ] **Step 4: 브라우저 확인**

- 루트 추가 (이름 + 색상) → 목록에 표시
- 노드에 루트 배정 → 노드 색상 변경
- 루트 삭제 → 소속 노드 색상 기본값 복귀
- "자동 정렬" 버튼 → 트리 형태로 정렬

- [ ] **Step 5: 커밋**

```bash
git add src/components/editor/RoutePanel.jsx src/components/editor/EditorToolbar.jsx src/components/editor/NodeSidebar.jsx
git commit -m "feat: route panel, editor toolbar with auto layout"
```

---

### Task 12: Auto Save + 데이터 로드 + EditorPage 완성

**Files:**
- Create: `src/hooks/useAutoSave.js`
- Create: `tests/hooks/useAutoSave.test.js`
- Modify: `src/pages/EditorPage.jsx` (완성본)

- [ ] **Step 1: useAutoSave 테스트**

`tests/hooks/useAutoSave.test.js`:

```js
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '../../src/hooks/useAutoSave'

vi.useFakeTimers()

describe('useAutoSave', () => {
  it('1초 뒤 저장 함수 1회 호출', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave(saveFn, 1000))

    act(() => result.current())
    expect(saveFn).not.toHaveBeenCalled()

    await act(async () => vi.advanceTimersByTime(1000))
    expect(saveFn).toHaveBeenCalledTimes(1)
  })

  it('연속 호출 시 마지막 1회만 실행 (디바운스)', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave(saveFn, 1000))

    act(() => { result.current(); result.current(); result.current() })
    await act(async () => vi.advanceTimersByTime(1000))
    expect(saveFn).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- --run tests/hooks/useAutoSave.test.js
```

Expected: FAIL

- [ ] **Step 3: useAutoSave 구현**

`src/hooks/useAutoSave.js`:

```js
import { useRef, useCallback } from 'react'

export function useAutoSave(saveFn, delay = 1000) {
  const timer = useRef(null)
  return useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => saveFn(), delay)
  }, [saveFn, delay])
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- --run tests/hooks/useAutoSave.test.js
```

Expected: PASS (2 tests)

- [ ] **Step 5: EditorPage 완성 (데이터 로드 + 자동저장 + 툴바)**

`src/pages/EditorPage.jsx` 전체 교체:

```jsx
import { useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEditorStore } from '../stores/editorStore'
import { useAutoSave } from '../hooks/useAutoSave'
import GraphCanvas from '../components/editor/GraphCanvas'
import NodeSidebar from '../components/editor/NodeSidebar'
import EditorToolbar from '../components/editor/EditorToolbar'

export default function EditorPage() {
  const { id: projectId } = useParams()
  const { nodes, edges, routes, selectedNodeId, loadGraph, setSaveStatus } = useEditorStore()
  const titleRef = useRef('')

  // 프로젝트 데이터 로드
  useEffect(() => {
    const load = async () => {
      const [{ data: project }, { data: dbNodes }, { data: dbEdges }, { data: dbRoutes }] =
        await Promise.all([
          supabase.from('projects').select('title').eq('id', projectId).single(),
          supabase.from('nodes').select('*').eq('project_id', projectId),
          supabase.from('edges').select('*').eq('project_id', projectId),
          supabase.from('routes').select('*').eq('project_id', projectId),
        ])

      titleRef.current = project?.title ?? ''

      const flowNodes = (dbNodes ?? []).map((n) => ({
        id: n.id,
        type: 'storyNode',
        position: { x: n.position_x, y: n.position_y },
        data: { title: n.title, nodeType: n.type, content: n.content ?? {}, color: n.color, routeId: n.route_id, projectId },
      }))

      const flowEdges = (dbEdges ?? []).map((e) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        type: 'labeledEdge',
        data: { label: e.label ?? '' },
      }))

      loadGraph({ projectId, nodes: flowNodes, edges: flowEdges, routes: dbRoutes ?? [] })
    }
    load()
  }, [projectId, loadGraph])

  // Supabase 저장 (덮어쓰기 방식: 삭제 → 삽입)
  const save = useCallback(async () => {
    setSaveStatus('saving')
    try {
      // 엣지 먼저 삭제 (nodes FK 참조), 그 다음 노드, 루트
      await supabase.from('edges').delete().eq('project_id', projectId)
      await supabase.from('nodes').delete().eq('project_id', projectId)
      await supabase.from('routes').delete().eq('project_id', projectId)

      const routeRows = routes.map((r) => ({ id: r.id, project_id: projectId, name: r.name, color: r.color }))
      const nodeRows = nodes.map((n) => ({
        id: n.id, project_id: projectId, route_id: n.data.routeId ?? null,
        type: n.data.nodeType, title: n.data.title, content: n.data.content,
        color: n.data.color ?? null, position_x: n.position.x, position_y: n.position.y,
      }))
      const edgeRows = edges.map((e) => ({
        id: e.id, project_id: projectId,
        source_node_id: e.source, target_node_id: e.target, label: e.data?.label ?? null,
      }))

      if (routeRows.length > 0) await supabase.from('routes').insert(routeRows)
      if (nodeRows.length > 0) await supabase.from('nodes').insert(nodeRows)
      if (edgeRows.length > 0) await supabase.from('edges').insert(edgeRows)

      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [nodes, edges, routes, projectId, setSaveStatus])

  const triggerSave = useAutoSave(save, 1500)

  // 변경 감지 → 자동저장 트리거 (로드 직후 불필요한 저장 방지: projectId 체크)
  useEffect(() => {
    if (useEditorStore.getState().projectId === projectId) triggerSave()
  }, [nodes, edges, routes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <EditorToolbar projectId={projectId} projectTitle={titleRef.current} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <GraphCanvas projectId={projectId} />
        {selectedNodeId && <NodeSidebar />}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 전체 테스트 통과 확인**

```bash
npm test -- --run
```

Expected: 모든 테스트 PASS

- [ ] **Step 7: E2E 브라우저 확인**

1. 로그인 → 대시보드 → 새 프로젝트 생성
2. 에디터: 노드 추가 → 내용 작성 → 1.5초 후 "저장됨 ✓"
3. 새로고침 → 데이터 유지
4. 모바일 브라우저(DevTools 모바일 뷰)에서 레이아웃 확인

- [ ] **Step 8: 커밋**

```bash
git add src/hooks/useAutoSave.js src/pages/EditorPage.jsx src/components/editor/EditorToolbar.jsx tests/hooks/useAutoSave.test.js
git commit -m "feat: auto save with debounce, data load, complete editor page"
```

---

### Task 13: PWA 설정

**Files:**
- Modify: `vite.config.js`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`

- [ ] **Step 1: vite-plugin-pwa 설치**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: PWA 아이콘 준비**

192×192, 512×512 PNG 아이콘을 `public/icons/` 에 배치.

ImageMagick 설치된 경우:
```bash
mkdir -p public/icons
convert -size 192x192 xc:#7c3aed -fill white -font DejaVu-Sans-Bold -pointsize 60 -gravity center -annotate 0 "IF" public/icons/icon-192.png
convert -size 512x512 xc:#7c3aed -fill white -font DejaVu-Sans-Bold -pointsize 160 -gravity center -annotate 0 "IF" public/icons/icon-512.png
```

없는 경우: 보라색(#7c3aed) 배경에 "IF" 흰색 텍스트 PNG를 직접 제작해서 배치.

- [ ] **Step 3: vite.config.js에 PWA 플러그인 추가**

`vite.config.js` 전체 교체:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'IFverse',
        short_name: 'IFverse',
        description: '모든 IF를 연결하다 — 스토리 분기 관리',
        theme_color: '#7c3aed',
        background_color: '#0a0a0f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
          handler: 'NetworkFirst',
          options: { cacheName: 'supabase-cache' },
        }],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
})
```

- [ ] **Step 4: 프로덕션 빌드 및 PWA 확인**

```bash
npm run build && npm run preview
```

`http://localhost:4173` 접속 → 브라우저 주소창에 설치 아이콘(⊕) 확인 → 설치 후 앱처럼 실행.

- [ ] **Step 5: 최종 전체 테스트**

```bash
npm test -- --run
```

Expected: 모든 테스트 PASS.

- [ ] **Step 6: 최종 커밋**

```bash
git add vite.config.js public/icons/
git commit -m "feat: PWA with vite-plugin-pwa, installable on mobile"
```

---

## Vercel 배포 (선택)

```bash
npm install -g vercel
vercel --prod
```

Vercel 대시보드 → Settings → Environment Variables 에 추가:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
