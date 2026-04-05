import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F766E 0%, #0B5B57 55%, #6B4B3E 100%)",
          color: "#F7F1E8",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 6,
            borderRadius: 18,
            border: "2px solid rgba(247, 241, 232, 0.22)",
          }}
        />
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(247, 241, 232, 0.14)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          B
        </div>
      </div>
    ),
    size
  );
}
