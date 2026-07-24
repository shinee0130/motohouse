import type { CSSProperties } from "react";

// Дизайны inline-style мөрийг (CSS text) React CSSProperties объект руу хөрвүүлнэ.
// Ингэснээр Claude Design эх загвартай 1:1 хадгалагдана.
export function sx(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const d = decl.trim();
    if (!d) continue;
    const i = d.indexOf(":");
    if (i === -1) continue;
    const key = d.slice(0, i).trim();
    const val = d.slice(i + 1).trim();
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = val;
  }
  return out as CSSProperties;
}
