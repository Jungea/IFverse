# IFverse

스토리 작가를 위한 분기/세계선 관리 PWA.  
노드 그래프로 스토리 분기를 시각화하고, 세계선(루트)별로 관리할 수 있다.

## 시작하기

### 1. Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. **SQL Editor** 에서 아래 파일 전체 실행:
   ```
   supabase/migrations/001_initial.sql
   ```
3. **Project Settings → API** 에서 다음 두 값 복사:
   - `Project URL`
   - `anon public` key

### 2. 환경 변수 설정

`.env.example`을 복사해서 `.env.local` 생성 후 값 입력:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxx...
```

### 3. 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.

---

## 커맨드

| 커맨드 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm test` | 테스트 실행 (watch) |
| `npm test -- --run` | 테스트 1회 실행 |

---

## 아키텍처

별도 백엔드 서버 없음. React SPA가 Supabase JS SDK로 직접 통신.

```
브라우저 (React SPA)
    ↕ Supabase JS SDK
Supabase
    ├── Auth (이메일 로그인/회원가입)
    ├── PostgreSQL (projects, nodes, edges, routes)
    └── RLS (사용자별 데이터 격리)
```

## 기술 스택

- **프론트엔드**: React 19 + Vite
- **그래프 에디터**: @xyflow/react (React Flow)
- **리치 텍스트**: @tiptap/react
- **상태 관리**: Zustand v5
- **자동 레이아웃**: dagre
- **인증/DB**: Supabase
- **PWA**: vite-plugin-pwa

## 배포 (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Vercel 대시보드 → Settings → Environment Variables 에서 아래 두 값 추가:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
