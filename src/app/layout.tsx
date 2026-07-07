import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency";
import { getRates } from "@/lib/fx";
import { AuthModalProvider } from "@/lib/authModal";
import { CartModalProvider } from "@/lib/cartModal";

export const metadata: Metadata = {
  title: "motohouse",
  description:
    "Монголд суурилсан мотоцикл, riding gear, сэлбэг, засвар үйлчилгээ болон олон улсын захиалга нийлүүлэлтийн платформ.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rates = await getRates();
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
          <I18nProvider>
            <CurrencyProvider rates={rates}>
              <AuthProvider>
                <AuthModalProvider>
                  <CartModalProvider>
                    <Nav />
                    <div style={{ flex: 1 }}>{children}</div>
                    <Footer />
                  </CartModalProvider>
                </AuthModalProvider>
              </AuthProvider>
            </CurrencyProvider>
          </I18nProvider>
        </div>
      </body>
    </html>
  );
}
