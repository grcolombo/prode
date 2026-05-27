import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const logoData = readFileSync(join(process.cwd(), "public/logo.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#442d8e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          alt="Tarifar"
          style={{ height: 160, objectFit: "contain" }}
        />
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: "#9b6ee0",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Ranking Prode Tarifar
        </div>
      </div>
    ),
    { ...size }
  );
}
