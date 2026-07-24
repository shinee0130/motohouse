import type { CSSProperties } from "react";

// Эх загварын <image-slot> placeholder-ийн орлуулга.
// Зураг ороогүй үед цэвэрхэн placeholder харуулна.
export function Slot({
  label,
  style,
  light = false,
}: {
  label: string;
  style?: CSSProperties;
  light?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "10px",
        background: light
          ? "#fff"
          : "linear-gradient(135deg,#0e0e10,#141417)",
        color: light ? "#9aa0a6" : "#3c3c42",
        font: "500 11px 'JetBrains Mono'",
        letterSpacing: ".08em",
        ...style,
      }}
    >
      {label}
    </div>
  );
}
