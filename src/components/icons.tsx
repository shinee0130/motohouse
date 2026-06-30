import type { CSSProperties } from "react";

// Энгийн stroke icon-ууд (trust bar болон category-д ашиглана).
const base = (s?: CSSProperties): CSSProperties => ({
  width: 26,
  height: 26,
  stroke: "currentColor",
  fill: "none",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...s,
});

export function IconTruck({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h3.5L21 12.5V15h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17.5" cy="17.5" r="1.6" />
    </svg>
  );
}

export function IconCard({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M6.5 15h4" />
    </svg>
  );
}

export function IconWrench({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <path d="M14.5 6.5a3.8 3.8 0 0 1-5 5L4 17l3 3 5.5-5.5a3.8 3.8 0 0 1 5-5l-2.3 2.3-2-2z" />
    </svg>
  );
}

export function IconShield({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <path d="M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconBike({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <circle cx="5.5" cy="16.5" r="3.2" />
      <circle cx="18.5" cy="16.5" r="3.2" />
      <path d="M5.5 16.5l4-7h5l2 4M9 9.5h4M15.5 13.5l-3.5 3M14.5 9.5l2-2h2" />
    </svg>
  );
}

export function IconHelmet({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <path d="M4 14a8 8 0 0 1 16 0v1H4z" />
      <path d="M4 15h12l3-1M10 7.2A8 8 0 0 0 5.2 12" />
    </svg>
  );
}

export function IconCog({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </svg>
  );
}
