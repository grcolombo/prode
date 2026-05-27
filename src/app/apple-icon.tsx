import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #1a0a3e 0%, #442d8e 100%)",
          borderRadius: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 90 }}>⚽</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#9b6ee0",
            letterSpacing: -1,
          }}
        >
          PRODE
        </div>
      </div>
    ),
    { ...size }
  );
}
