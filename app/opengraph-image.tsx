import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "HOT MESS";
  const tagline = process.env.NEXT_PUBLIC_SITE_TAGLINE || "Radio • Records • Community";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0b0b",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.0))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 600px at 0% 0%, rgba(255,122,122,0.25) 0%, rgba(0,0,0,0) 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 600px at 100% 100%, rgba(122,163,255,0.25) 0%, rgba(0,0,0,0) 60%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 80 }}>
          <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: -1 }}>{siteName}</div>
          <div style={{ fontSize: 36, opacity: 0.88 }}>{tagline}</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
