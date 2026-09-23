import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f4efe7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#17324f",
        }}
      >
        <div
          style={{
            width: 1000,
            display: "flex",
            alignItems: "center",
            gap: 70,
          }}
        >
          <div
            style={{
              width: 330,
              height: 230,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 240,
                height: 145,
                background: "#234f7f",
                border: "6px solid #d7af47",
                clipPath:
                  "polygon(5% 15%, 82% 5%, 100% 22%, 92% 88%, 18% 100%, 0% 78%)",
                position: "relative",
                boxShadow: "0 18px 30px rgba(23,50,79,.18)",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: 7,
                height: 125,
                background: "#f5f1e9",
                transform: "rotate(11deg)",
                left: 112,
              }}
            />

            <div
              style={{
                position: "absolute",
                width: 7,
                height: 125,
                background: "#f5f1e9",
                transform: "rotate(11deg)",
                left: 166,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 88,
                fontFamily: "Georgia, serif",
                letterSpacing: "0.12em",
                lineHeight: 1,
              }}
            >
              USS X
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 26,
                letterSpacing: "0.42em",
                color: "#7188a1",
                fontFamily: "Arial, sans-serif",
              }}
            >
              KREATIV
            </div>

            <div
              style={{
                marginTop: 28,
                fontSize: 28,
                maxWidth: 520,
                lineHeight: 1.25,
                fontFamily: "Georgia, serif",
              }}
            >
              TEXTILE BRICKS · RECYCLED MATERIAL
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
