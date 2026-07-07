import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Сошиал/мессенжерт линк share хийхэд гарах branded зураг (1200×630).
export const alt = "MOTO HOUSE — RIDE. POWER. LIVE.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/assets/motohouse_logo_long_t.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070708",
          position: "relative",
        }}
      >
        {/* улаан гэрэлтэл — зүүн дээд */}
        <div
          style={{
            position: "absolute",
            top: -260,
            left: -200,
            width: 820,
            height: 820,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(225,6,19,0.32) 0%, rgba(225,6,19,0) 70%)",
            display: "flex",
          }}
        />
        {/* улаан гэрэлтэл — баруун доод */}
        <div
          style={{
            position: "absolute",
            bottom: -280,
            right: -200,
            width: 760,
            height: 760,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(225,6,19,0.20) 0%, rgba(225,6,19,0) 70%)",
            display: "flex",
          }}
        />

        {/* лого — бүтнээр нь голд */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={880} height={Math.round((880 * 294) / 1899)} alt="MOTO HOUSE" />

        {/* доод улаан зурвас */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: "#E10613",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
