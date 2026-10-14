import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";

export async function GET() {
  try {
    const goldPath = path.join(process.cwd(), "public", "certificate-gold.jpg");
    // Extract raw pixels from x=310..360, y=300..450
    const { data, info } = await sharp(goldPath)
      .extract({ left: 310, top: 300, width: 50, height: 150 })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Look for dark pixels (text) vs light pixels (parchment)
    // Dark pixels will have R+G+B < 300
    const darkPixels = [];
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (r < 100 && g < 100 && b < 100) {
          darkPixels.push({ x: 310 + x, y: 300 + y, r, g, b });
        }
      }
    }

    return NextResponse.json({
      success: true,
      foundDarkPixels: darkPixels.length,
      sampleDarkY: darkPixels.slice(0, 15).map(p => p.y),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
