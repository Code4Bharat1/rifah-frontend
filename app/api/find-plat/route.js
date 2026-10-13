import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const platSource = path.join(pubDir, "test-plat-cand1.jpg");
    const image = sharp(platSource);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    let hits = [];
    for (let y = 100; y < 600; y += 10) {
      for (let x = 300; x < 900; x += 10) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        if (r < 100 && g < 100 && b < 100) {
          hits.push({ x, y, r, g, b });
          if (hits.length > 20) break;
        }
      }
      if (hits.length > 20) break;
    }

    return NextResponse.json({ success: true, hits });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
