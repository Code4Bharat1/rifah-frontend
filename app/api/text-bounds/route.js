import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const refPath = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\.tempmediaStorage\\media_1791635372929.jpg";
    const image = sharp(refPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // 1. Body text bounds (x: 290..980, y: 280..550)
    let bodyMinX = info.width, bodyMaxX = 0, bodyMinY = info.height, bodyMaxY = 0;
    let bodyCount = 0;
    for (let y = 280; y < 550; y++) {
      for (let x = 290; x < 980; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 180) {
          if (x < bodyMinX) bodyMinX = x;
          if (x > bodyMaxX) bodyMaxX = x;
          if (y < bodyMinY) bodyMinY = y;
          if (y > bodyMaxY) bodyMaxY = y;
          bodyCount++;
        }
      }
    }

    // 2. Meta box text bounds (x: 455..985, y: 228..256)
    let metaMinX = info.width, metaMaxX = 0, metaMinY = info.height, metaMaxY = 0;
    let metaCount = 0;
    for (let y = 228; y <= 256; y++) {
      for (let x = 455; x <= 985; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        // Text is darker than metallic gradient
        if (lum < 200) {
          if (x < metaMinX) metaMinX = x;
          if (x > metaMaxX) metaMaxX = x;
          if (y < metaMinY) metaMinY = y;
          if (y > metaMaxY) metaMaxY = y;
          metaCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      body: { minX: bodyMinX, maxX: bodyMaxX, minY: bodyMinY, maxY: bodyMaxY, count: bodyCount },
      meta: { minX: metaMinX, maxX: metaMaxX, minY: metaMinY, maxY: metaMaxY, count: metaCount },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
