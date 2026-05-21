import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "linear-gradient(135deg, #1a0a3e 0%, #0a0614 100%)",
          borderRadius: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 240 }}>⚽</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#9b6ee0",
            letterSpacing: -2,
          }}
        >
          PRODE
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#4c2a8a",
          }}
        >
          Mundial 2026
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
