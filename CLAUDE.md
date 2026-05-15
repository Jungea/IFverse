# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# IFverse

스토리 작가를 위한 분기/세계선 관리 PWA. 노드 그래프로 스토리 분기를 시각화하고 관리한다.

## 커맨드

```bash
npm run dev       # 개발 서버
npm run lint      # ESLint 검사
npm test          # 테스트 (watch)
npm test -- --run # 테스트 1회 실행
npm test -- tests/stores/editorStore.test.js --run  # 파일 단위 테스트
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
```

## 아키텍처

React SPA가 Supabase JS SDK로 직접 통신. 별도 백엔드 없음.

- **상태 관리**: Zustand v5 — `authStore`, `projectStore`, `editorStore`
- **그래프 에디터**: @xyflow/react (React Flow)
- **리치 텍스트**: @tiptap/react + @tiptap/starter-kit
- **라우팅**: react-router-dom v7
- **자동 레이아웃**: dagre (TB 방향)
- **인증/DB**: Supabase (Auth + PostgreSQL + RLS)
- **PWA**: vite-plugin-pwa

## 테스트

Vitest + jsdom 환경. globals 활성화.

Zustand 스토어는 `useXxxStore.setState()`로 상태를 직접 주입하고 `useXxxStore.getState()`로 결과를 검증한다. 각 테스트는 `beforeEach`에서 초기 상태로 리셋.

## 주요 규칙

### Zustand
- `set()` 내부에서 상태를 읽을 때는 반드시 함수형 `set((state) => ...)` 사용
- 컴포넌트에서 액션 호출 시 반환값은 정상적으로 받을 수 있음 (vanilla Zustand)

### 노드 색상 우선순위
1. `node.data.color` (개별 오버라이드, `!= null` 체크)
2. `node.data.routeId` → 루트 색상
3. 타입 기본값: `scene: #4f46e5`, `branch: #7c3aed`, `ending: #059669`

### 저장 전략
- `EditorPage`가 저장 로직을 소유, `useAutoSave`로 1500ms 디바운스
- upsert 후 orphan 삭제 방식 (delete-then-insert 금지 — 데이터 유실 위험)
- 저장 순서: routes → nodes → edges (FK 의존성)
- 삭제 순서: edges → nodes → routes

### GraphCanvas UX
- 캔버스 더블클릭 → 클릭 위치에 노드 생성 (`storyNode` 타입, 기본 `scene`)
- `Delete` 키 → React Flow 기본 동작으로 선택된 노드/엣지 삭제

### 환경 변수
`.env.local` 필요:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## DB 스키마

`supabase/migrations/001_initial.sql` 참조. 테이블: `projects`, `nodes`, `edges`, `routes`. 모든 테이블에 RLS 적용.
