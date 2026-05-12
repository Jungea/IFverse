# IFverse

스토리 작가를 위한 분기/세계선 관리 PWA. 노드 그래프로 스토리 분기를 시각화하고 관리한다.

## 커맨드

```bash
npm run dev       # 개발 서버
npm test          # 테스트 (watch)
npm test -- --run # 테스트 1회 실행
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
```

## 아키텍처

React SPA가 Supabase JS SDK로 직접 통신. 별도 백엔드 없음.

- **상태 관리**: Zustand v5 — `authStore`, `projectStore`, `editorStore`
- **그래프 에디터**: @xyflow/react (React Flow)
- **리치 텍스트**: @tiptap/react + @tiptap/starter-kit
- **라우팅**: react-router-dom v6
- **자동 레이아웃**: dagre (TB 방향)
- **인증/DB**: Supabase (Auth + PostgreSQL + RLS)
- **PWA**: vite-plugin-pwa

## 파일 구조

```
src/
├── lib/
│   ├── supabase.js          # Supabase 클라이언트 싱글톤
│   └── autoLayout.js        # dagre 자동 레이아웃 순수 함수
├── stores/
│   ├── authStore.js         # 유저 인증 상태
│   ├── projectStore.js      # 프로젝트 목록 CRUD
│   └── editorStore.js       # 노드/엣지/루트 에디터 상태
├── hooks/
│   └── useAutoSave.js       # 디바운스 자동저장 훅
├── pages/
│   ├── LandingPage.jsx      # / (로그인/회원가입)
│   ├── DashboardPage.jsx    # /dashboard
│   └── EditorPage.jsx       # /project/:id
└── components/
    ├── auth/
    │   ├── AuthForm.jsx
    │   └── ProtectedRoute.jsx
    ├── dashboard/
    │   ├── ProjectCard.jsx
    │   └── NewProjectModal.jsx
    └── editor/
        ├── EditorToolbar.jsx
        ├── GraphCanvas.jsx
        ├── NodeSidebar.jsx
        ├── RoutePanel.jsx
        ├── nodes/StoryNode.jsx    # getNodeColor export 포함
        └── edges/LabeledEdge.jsx

tests/
├── stores/                  # editorStore, authStore, projectStore
├── hooks/                   # useAutoSave
└── lib/                     # autoLayout, getNodeColor
```

## 주요 규칙

### Zustand
- `set()` 내부에서 상태를 읽을 때는 반드시 함수형 `set((state) => ...)` 사용
- 컴포넌트에서 액션 호출 시 반환값은 정상적으로 받을 수 있음 (vanilla Zustand)

### 노드 색상 우선순위
1. `node.data.color` (개별 오버라이드, `!= null` 체크)
2. `node.data.routeId` → 루트 색상
3. 타입 기본값: `scene: #4f46e5`, `branch: #7c3aed`, `ending: #059669`

### 저장 전략
- upsert 후 orphan 삭제 방식 (delete-then-insert 금지 — 데이터 유실 위험)
- 저장 순서: routes → nodes → edges (FK 의존성)
- 삭제 순서: edges → nodes → routes

### 환경 변수
`.env.local` 필요:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## DB 스키마

`supabase/migrations/001_initial.sql` 참조. 테이블: `projects`, `nodes`, `edges`, `routes`. 모든 테이블에 RLS 적용.
