import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const shareImageSize = { width: 1200, height: 630 };
export const shareImageAlt = `Respondi. Menos mensajes, más tiempo para ti. ${site.priceLabel}.`;

export async function createShareImage() {
  const mark = await readFile(
    join(process.cwd(), "src/assets/brand/mark.png"),
  );
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F8F6EF",
          padding: "72px",
          color: "#162922",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* ImageResponse renders this markup with Satori, which only accepts img. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={96} height={96} alt="" />
          <div style={{ fontSize: "56px", fontWeight: 700 }}>Respondi</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: "980px",
            }}
          >
            Menos mensajes, más tiempo para ti.
          </div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#126654" }}>
            {site.priceLabel}
          </div>
        </div>
      </div>
    ),
    shareImageSize,
  );
}
