import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "motohouse",
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
          <AuthProvider>
            <Nav />
            <div style={{ flex: 1 }}>{children}</div>
            <Footer />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
