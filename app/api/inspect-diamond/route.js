import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diamondSrc = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\.tempmediaStorage\\media_1791635381273.jpg";
    const img = sharp(diamondSrc);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width, h = info.height, ch = info.channels;

    // Scan for signature 1 (Chairman) around x=200..500, y=520..660
    // Look for the dark blue/red text "S AMEENUL HASAN" (red text: r>120, g<60, b<60)
    let sig1RedPixels = [];
    for (let y = 570; y <= 660; y++) {
      for (let x = 200; x <= 500; x++) {
        const idx = (y * w + x) * ch;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        if (r > 130 && g < 60 && b < 70) {
          sig1RedPixels.push({ x, y });
        }
      }
    }

    // Scan for signature 2 (General Secretary) around x=500..800, y=570..660
    let sig2RedPixels = [];
    for (let y = 570; y <= 660; y++) {
      for (let x = 500; x <= 800; x++) {
        const idx = (y * w + x) * ch;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        if (r > 130 && g < 60 && b < 70) {
          sig2RedPixels.push({ x, y });
        }
      }
    }

    // Find min and max for both
    const getBounds = (pts) => {
      if (!pts.length) return null;
      let minX = pts[0].x, maxX = pts[0].x, minY = pts[0].y, maxY = pts[0].y;
      for (const p of pts) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
      return { minX, maxX, minY, maxY, count: pts.length };
    };

    return NextResponse.json({
      sig1NameBounds: getBounds(sig1RedPixels),
      sig2NameBounds: getBounds(sig2RedPixels),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message });
  }
}
