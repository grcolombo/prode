import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "linear-gradient(135deg, #1a0a3e 0%, #0a0614 100%)",
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
            fontSize: 24,
            fontWeight: 900,
            color: "#9b6ee0",
          }}
        >
          PRODE
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
