# 배포 가이드

## Vercel

### 1. Vercel CLI 설치 및 배포

```bash
npm install -g vercel
vercel --prod
```

### 2. 환경 변수 설정

Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables** 에서 추가:

| 키 | 값 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

### 3. 빌드 설정

Vercel이 자동으로 감지하지만, 수동 설정 시:

| 항목 | 값 |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## 로컬 빌드 확인

배포 전 로컬에서 프로덕션 빌드를 미리 확인할 수 있다:

```bash
npm run build
npm run preview
```

`http://localhost:4173` 에서 확인.
