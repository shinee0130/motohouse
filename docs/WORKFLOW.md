# MOTO HOUSE — Ажлын урсгал (dev / prod)

Энэ төсөл **2 орчинтой**. Хөгжүүлэгч бүр зөвхөн `dev` дээр ажиллана. `main` (prod)
руу зөвхөн эзний (owner) зөвшөөрлөөр л код ордог.

## Орчин

| Орчин | Салбар | Хаяг | Хэн деплойлдог |
|-------|--------|------|----------------|
| **PROD** | `main` | https://motohouse.mn | Зөвхөн эзэн PR-г merge хийхэд Vercel автоматаар |
| **DEV**  | `dev`  | https://motohouse-git-dev-shinee0130s-projects.vercel.app | `dev` рүү push бүрт Vercel автоматаар |

> `main` салбар **түгжээтэй**: шууд push хийх боломжгүй. Зөвхөн PR дамжуулж,
> кодын эзэн (@shinee0130) зөвшөөрч байж merge хийнэ.

## Хөгжүүлэгчийн урсгал

```bash
# 1. dev-ээс салбар гаргах
git checkout dev
git pull origin dev
git checkout -b feature/миний-ажил

# 2. Ажиллаад commit хийх
git add -A
git commit -m "Юу хийснээ товч бич"

# 3. dev рүү нэгтгэх (шууд эсвэл PR-ээр)
git checkout dev
git merge feature/миний-ажил
git push origin dev
#   → dev preview хаяг дээр автоматаар шинэчлэгдэнэ. Энд туршина.
```

## Prod руу гаргах (зөвхөн эзэн)

1. Хөгжүүлэгч `dev`-ээ бэлэн болгоно.
2. GitHub дээр **`dev` → `main`** PR нээнэ.
3. **Эзэн (@shinee0130)** өөрчлөлтийг хянаж, зөвшөөрөл (approve) өгнө.
4. Эзэн PR-г **merge** хийнэ → Vercel `main`-г prod (motohouse.mn) руу деплойлно.

CLI-аар PR нээх жишээ:

```bash
gh pr create --base main --head dev --title "Prod руу гаргах" --body "dev дээрх өөрчлөлтүүд"
```

## Өгөгдлийн сан (Supabase)

- **PROD DB** — жинхэнэ хэрэглэгчийн өгөгдөл. Зөвхөн prod ашиглана.
- **DEV DB** — тусдаа Supabase project. Хөгжүүлэгчид энд туршина, жинхэнэ өгөгдөлд хүрэхгүй.

Env түлхүүрүүд Vercel дээр орчноор ялгаатай тохируулагдсан:
- Production → prod Supabase
- Preview (`dev`) → dev Supabase
