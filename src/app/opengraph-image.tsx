import { SITE_NAME, SITE_TITLE } from "@/lib/seo";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
          "radial-gradient(circle at 8% 10%, rgba(37, 99, 235, 0.26), transparent 34%), radial-gradient(circle at 94% 18%, rgba(22, 196, 165, 0.22), transparent 36%), linear-gradient(180deg, #f7faff 0%, #e8f0ff 100%)",
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#2650af",
        }}
      >
        {SITE_NAME}
      </div>
      <div
        style={{
          maxWidth: "900px",
          fontSize: 60,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
        }}
      >
        {SITE_TITLE}
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          fontSize: 32,
          color: "#1f4ab0",
        }}
      >
        <span>POS</span>
        <span>•</span>
        <span>CRM</span>
        <span>•</span>
        <span>Склад</span>
        <span>•</span>
        <span>Аналитика</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
