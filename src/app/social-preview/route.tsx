import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#f4efe7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#17324f",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "70px",
          }}
        >
          <div
            style={{
              width: "330px",
              height: "230px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "240px",
                height: "145px",
                background: "#234f7f",
                border: "6px solid #d7af47",
                clipPath:
                  "polygon(5% 15%, 82% 5%, 100% 22%, 92% 88%, 18% 100%, 0% 78%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: "7px",
                height: "125px",
                background: "#f5f1e9",
                transform: "rotate(11deg)",
                left: "112px",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: "7px",
                height: "125px",
                background: "#f5f1e9",
                transform: "rotate(11deg)",
                left: "166px",
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
                fontSize: "92px",
                fontFamily: "Georgia",
                letterSpacing: "12px",
              }}
            >
              USS X
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "30px",
                fontFamily: "Arial",
                letterSpacing: "16px",
                color: "#7188a1",
              }}
            >
              KREATIV
            </div>

            <div
              style={{
                marginTop: "26px",
                fontSize: "28px",
                fontFamily: "Georgia",
                lineHeight: 1.25,
              }}
            >
              RECYCLED TEXTILE MATERIAL
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
