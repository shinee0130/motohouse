import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "MOTO HOUSE — Ride. Power. Live.",
  description:
    "Мотоцикл худалдаа, premium gear, performance parts, засвар үйлчилгээ болон rider community-ийн нэгдсэн платформ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body>
        <div
          style={{
            background: "#050505",
            color: "#fff",
            fontFamily: "Roboto, sans-serif",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Nav />
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
