import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px",
        color: "#13274d",
        background:
          "radial-gradient(circle at 4% 8%, rgba(61, 138, 255, 0.26), transparent 38%), radial-gradient(circle at 88% 18%, rgba(22, 196, 165, 0.22), transparent 36%), linear-gradient(180deg, #f7fbff 0%, #e7f0ff 100%)",
      }}
    >
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#1f4ab0",
        }}
      >
        {SITE_NAME}
      </div>
      <div
        style={{
          maxWidth: "960px",
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.25,
        }}
      >
        {SITE_DESCRIPTION}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
