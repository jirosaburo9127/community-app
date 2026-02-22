import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "nest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            backgroundColor: "#1a1a1a",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "Helvetica Neue, Arial, sans-serif",
            }}
          >
            n
          </span>
        </div>
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
          }}
        >
          nest
        </span>
        <span
          style={{
            fontSize: 20,
            color: "#999999",
            marginTop: 12,
            fontFamily: "Helvetica Neue, Arial, sans-serif",
          }}
        >
          三重の若者が小さな挑戦を続けられる場所
        </span>
      </div>
    ),
    { ...size }
  );
}
