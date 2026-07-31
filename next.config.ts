import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Барааны зургууд Supabase Storage дээр. Оновчлогч зөвхөн эдгээр хаягийг
    // хүлээж авна — бусад хостоос зураг дамжуулах боломжгүй.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ejdvftjtotahcummzlpn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Жижигрүүлсэн хувилбарыг CDN дээр 30 хоног барина. Эх зураг солигдвол
    // шинэ файлын нэртэй болдог тул кэш хуучрах эрсдэлгүй.
    minimumCacheTTL: 2592000,
  },
};

export default nextConfig;
