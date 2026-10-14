import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const refPath = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\.tempmediaStorage\\media_1791635372929.jpg";
    const image = sharp(refPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // Find the border of the meta box around y: 200-260, x: 400-990
    // Border color is bluish: e.g. R around 70-130, G around 110-160, B around 160-210
    const borderPixels = [];
    for (let y = 190; y < 270; y++) {
      for (let x = 400; x < 1000; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        // Blue border line check
        if (b > r + 30 && b > g && b > 100 && b < 210) {
          borderPixels.push({ x, y, r, g, b });
        }
      }
    }

    let minX = 10000, maxX = 0, minY = 10000, maxY = 0;
    for (const p of borderPixels) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    return NextResponse.json({
      borderPixelsCount: borderPixels.length,
      boxBounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
      sampleColors: borderPixels.slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
