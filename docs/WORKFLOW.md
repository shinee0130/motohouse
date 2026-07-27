# MOTO HOUSE — Ажлын урсгал (dev / prod)

Төсөл **2 салбартай**. Бүх хөгжүүлэлт `dev` дээр явагдаж, тогтвортой болсныхоо
дараа `main` (prod) руу гардаг.

| Орчин | Салбар | Хаяг | Хэзээ шинэчлэгдэх |
|-------|--------|------|-------------------|
| **DEV** (staging) | `dev` | https://motohouse-git-dev-shinee0130s-projects.vercel.app | `dev` рүү push бүрт Vercel автоматаар |
| **PROD** | `main` | https://motohouse.mn | `dev`-ийг `main` руу merge хийхэд Vercel автоматаар |

## Урсгал

```bash
# 1. dev дээр ажиллах
git checkout dev
# ... код бичих ...
git add -A
git commit -m "Юу хийснээ товч бич"
git push origin dev
#   → dev preview дээр автоматаар шинэчлэгдэнэ. ЭНД шалгана.

# 2. Тогтвортой бол prod руу гаргах (dev → main)
git checkout main
git merge dev --ff-only
git push origin main
#   → Vercel motohouse.mn руу автоматаар деплойлно.
git checkout dev
```

## Зарчим
- **Ажлын салбар = `dev`.** Шинэ өөрчлөлт эхлээд ЗААВАЛ dev дээр, preview дээр шалгагдана.
- **Prod = эзний шийдвэрээр.** dev тогтвортой болоод, "гарга" гэсэн үед л `main` руу merge.
- **DB схемийн өөрчлөлт болгоомжтой:** dev+prod нэг Supabase хуваалцдаг тул
  migration/RLS/policy өөрчлөлт шууд prod-д нөлөөлнө. Additive (нэмэх) байлга.
