# IFverse — 설계 문서

**작성일:** 2026-05-10
**서비스명:** IFverse (IF + Universe)
**슬로건:** 모든 IF를 연결하다

---

## 개요

스토리 작가를 위한 분기/세계선 관리 서비스. 스토리가 마인드맵처럼 뻗어나가며, 특정 선택(IF)에 따라 세계선이 갈라지는 구조를 시각적으로 설계하고 관리할 수 있는 창작용 툴.

**대상:** 웹소설, 웹툰, 게임 시나리오, 비주얼노벨 작가 (개인 창작가)

---

## MVP 범위

### 포함
- 프로젝트(스토리) 생성/삭제/목록 관리
- 분기 그래프 편집 (노드 추가/삭제, 연결선 드래그)
- 혼합형 레이아웃: 자동 트리 정렬 + 수동 위치 조정
- 노드 내 텍스트 작성 (리치 텍스트 에디터)
- 노드 타입: scene / branch / ending
- 연결선(엣지)에 선택지 텍스트 라벨 입력
- 루트(세계선)별 노드 색상 자동 상속 + 개별 오버라이드
- 이메일 로그인/회원가입
- 클라우드 저장 (멀티 디바이스 동기화)
- 자동 저장 (디바운스)
- PWA (홈 화면 설치, 오프라인 캐시)

### 제외 (향후 확장)
- AI 스토리 생성
- 캐릭터 관계도
- 루트 충돌 감지 / 설정 오류 체크
- 세계관 위키
- 엔딩 시뮬레이션
- 협업/공유 기능
- 네이티브 앱 (React Native / Flutter)

---

## 기술 스택

| 항목 | 기술 |
|---|---|
| 프론트엔드 | React + Vite |
| 그래프 에디터 | React Flow (@xyflow/react) |
| 텍스트 에디터 | Tiptap |
| 상태 관리 | Zustand |
| 백엔드/DB | Supabase (Auth + PostgreSQL + Storage) |
| PWA | vite-plugin-pwa |
| 배포 | Vercel (무료) |

백엔드 서버 별도 없음. React 앱이 Supabase JS SDK로 직접 통신. Supabase RLS(Row Level Security)로 본인 데이터만 접근하도록 보호.

---

## 아키텍처

```
[브라우저 / PWA]
  React + Vite
  React Flow  ← 그래프 에디터
  Tiptap      ← 노드 내 텍스트 에디터
  Zustand     ← 상태 관리
  vite-plugin-pwa
        |
        | Supabase JS SDK (HTTPS)
        v
[Supabase]
  Auth         — 이메일 로그인
  PostgreSQL   — 프로젝트/노드/엣지 데이터
  Storage      — 추후 이미지 첨부 등
        |
        v
[Vercel]  — 정적 배포 (무료)
```

---

## 데이터 모델

```sql
-- 프로젝트 (스토리 하나)
projects
  id          uuid PK
  user_id     uuid FK → auth.users
  title       text
  description text
  created_at  timestamptz
  updated_at  timestamptz

-- 노드 (장면/분기점/엔딩)
nodes
  id          uuid PK
  project_id  uuid FK → projects
  route_id    uuid FK → routes (nullable) -- 속한 루트
  type        text  -- 'scene' | 'branch' | 'ending'
  title       text
  content     jsonb -- Tiptap JSON
  color       text  -- 개별 오버라이드 색상 (null이면 루트 색상 사용)
  position_x  float
  position_y  float
  created_at  timestamptz

-- 엣지 (연결선/선택지)
edges
  id              uuid PK
  project_id      uuid FK → projects
  source_node_id  uuid FK → nodes
  target_node_id  uuid FK → nodes
  label           text  -- 선택지 텍스트 (예: "기억을 직면하다")
  created_at      timestamptz

-- 루트 (세계선) — 노드 그룹핑 및 색상 관리
routes
  id          uuid PK
  project_id  uuid FK → projects
  name        text  -- 예: "루트 A", "진실의 세계선"
  color       text  -- hex 색상값
  created_at  timestamptz

```

---

## 화면 구성

| 경로 | 화면 |
|---|---|
| `/` | 랜딩 페이지 (로그인/회원가입) |
| `/dashboard` | 프로젝트 목록 |
| `/project/:id` | 메인 에디터 |

### 메인 에디터 레이아웃

```
┌─────────────────────────────────────────────────┐
│  ← 목록   프로젝트명   [+ 노드] [자동정렬] [저장됨] │  ← 상단 툴바
├──────────────────────────────┬──────────────────┤
│                              │  노드 사이드패널  │
│                              │  (노드 클릭 시)  │
│   React Flow 캔버스          │  - 노드 타입     │
│   (그래프 편집 영역)          │  - 제목          │
│                              │  - Tiptap 에디터  │
│   [미니맵]        [+][−]     │  - 나가는 선택지  │
└──────────────────────────────┴──────────────────┘
```

### 노드 타입 및 기본 색상

| 타입 | 역할 | 기본 색상 |
|---|---|---|
| scene | 일반 장면 | 루트 색상 따름 |
| branch | 분기점 (선택지 발생) | 루트 색상 따름 |
| ending | 엔딩 노드 | 초록 (#059669) 기본, 색상 오버라이드로 배드엔딩은 빨강 (#dc2626) |

루트를 지정하면 해당 루트에 속한 노드들은 루트 색상을 자동 상속. 개별 노드에서 색상 오버라이드 가능.

---

## 핵심 기능 상세

### 그래프 편집
- 노드 추가: 툴바 버튼 또는 빈 캔버스 더블클릭
- 연결: 노드 핸들에서 드래그하여 다른 노드에 연결
- 자동 정렬: 위→아래 트리 레이아웃 (dagre 알고리즘)
- 수동 위치: 노드 드래그로 위치 조정, position_x/y에 저장

### 노드 사이드패널
- 노드 클릭 시 우측 패널 열림
- 제목 인라인 편집
- 타입 변경 (scene / branch / ending)
- Tiptap 에디터: Bold, Italic, Heading, 목록 지원
- 나가는 엣지(선택지) 목록 표시 및 라벨 편집
- 루트 지정 및 색상 오버라이드

### 자동 저장
- 편집 후 1초 디바운스로 Supabase에 자동 저장
- 상단 툴바에 "저장됨 ✓" / "저장 중..." 상태 표시

### PWA
- vite-plugin-pwa로 서비스워커 등록
- 홈 화면 설치 가능
- 앱 셸(shell) 오프라인 캐시 — 그래프 데이터는 온라인 필요

---

## 향후 확장 방향
- 네이티브 앱: 백엔드 API 재사용, React Native 또는 Flutter 프론트 추가
- 협업: Supabase Realtime 활용
- AI: Supabase Edge Functions로 Claude/GPT 연동
- 루트 충돌 감지, 세계관 위키, 캐릭터 관계도
