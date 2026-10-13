import { NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const refPath = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\.tempmediaStorage\\media_1791635372929.jpg";
    const img = sharp(refPath);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

    // Look for text pixels (dark pixels: r < 120, g < 120, b < 120) in x: 30 to 260, y: 590 to 680
    const textPixels = [];
    for (let y = 590; y <= 680; y++) {
      for (let x = 30; x <= 260; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        if (r < 100 && g < 100 && b < 100) {
          textPixels.push({ x, y, r, g, b });
        }
      }
    }

    let minX = 10000, maxX = 0, minY = 10000, maxY = 0;
    for (const p of textPixels) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    // Also look at background color around y = 595, x = 100
    const bgSamples = [];
    for (let y = 585; y <= 598; y += 3) {
      for (let x = 40; x <= 220; x += 40) {
        const idx = (y * info.width + x) * info.channels;
        bgSamples.push({ x, y, r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }

    return NextResponse.json({
      textPixelsCount: textPixels.length,
      bounds: { minX, maxX, minY, maxY },
      bgSamples,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
