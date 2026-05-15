# 배포 가이드

## Vercel

```bash
npm install -g vercel
vercel --prod
```

**환경 변수** — Vercel 대시보드 → Settings → Environment Variables:

| 키 | 값 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

빌드 설정(Build Command, Output Directory)은 Vercel이 Vite 프로젝트를 자동 감지한다.

---

## 로컬 빌드 확인

```bash
npm run build && npm run preview
```

`http://localhost:4173` 에서 확인.
