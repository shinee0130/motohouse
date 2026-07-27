# MOTO HOUSE

**RIDE. POWER. LIVE.** — Монголд суурилсан мотоцикл, riding gear, сэлбэг, засвар үйлчилгээ
болон олон улсын захиалгын онлайн платформ.

🔗 Prod: [motohouse.mn](https://motohouse.mn)

## Технологи

| Давхарга | Технологи |
|----------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Хэл | TypeScript |
| Загвар | Tailwind CSS 4 |
| Backend / DB | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Төлбөр | Bonum PSP |
| Имэйл | Resend |
| Hosting | Vercel |

> ⚠️ Энэ төслийн Next.js хувилбар нь өөрчлөгдсөн API-тай. Код бичихээс өмнө
> `node_modules/next/dist/docs/` доторх холбогдох зааврыг уншина уу (`AGENTS.md`-г үз).

## Эхлүүлэх

Node 24+ шаардлагатай.

```bash
npm install
npm run dev
```

Дараа нь [http://localhost:3000](http://localhost:3000)-г нээнэ.

### Орчны хувьсагч (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

`NEXT_PUBLIC_*` түлхүүрүүд нийтийн (browser bundle-д ордог) бөгөөд RLS-ээр хамгаалагдсан.

## Ажлын урсгал (dev / prod)

Энэ төсөл **2 салбартай**. **Бүх хөгжүүлэлт `dev` салбар дээр** явагдаж, тогтвортой
болсны дараа `main` (prod) руу гардаг.

| Орчин | Салбар | Хаяг |
|-------|--------|------|
| **DEV** (staging) | `dev` | https://motohouse-git-dev-shinee0130s-projects.vercel.app |
| **PROD** | `main` | https://motohouse.mn |

- `dev` рүү push бүрт dev preview хаяг автоматаар шинэчлэгдэнэ — энд шалгана.
- Тогтвортой бол `dev`-ийг `main` руу merge → Vercel prod-руу автомат деплой.

📄 Дэлгэрэнгүй: [docs/WORKFLOW.md](docs/WORKFLOW.md)

## Скриптүүд

```bash
npm run dev     # хөгжүүлэлтийн сервер
npm run build   # production build
npm run start   # build-ийг ажиллуулах
npm run lint    # ESLint
```
