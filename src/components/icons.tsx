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
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2.5V6M12 18v3.5M2.5 12H6M18 12h3.5M5.3 5.3l2.4 2.4M16.3 16.3l2.4 2.4M18.7 5.3l-2.4 2.4M7.7 16.3l-2.4 2.4" />
    </svg>
  );
}

export function IconHome({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

export function IconMap({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

export function IconFlag({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <path d="M5 21V4" />
      <path d="M5 4h13l-2.5 4L18 12H5" />
    </svg>
  );
}

export function IconGift({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <rect x="4" y="8" width="16" height="4" />
      <path d="M6 12v8h12v-8" />
      <path d="M12 8v12" />
      <path d="M12 8c-2-4.5-7-2.5-4.5 0M12 8c2-4.5 7-2.5 4.5 0" />
    </svg>
  );
}

export function IconCart({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={base(style)}>
      <path d="M3 5h2.5l2 11h11l2-8H7" />
      <circle cx="9.5" cy="19.5" r="1.5" />
      <circle cx="17" cy="19.5" r="1.5" />
    </svg>
  );
}
