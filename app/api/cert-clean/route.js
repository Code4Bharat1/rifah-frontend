import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const backupPath = path.join(pubDir, "certificate-gold-backup.jpg");

    // Inpaint each of the 3 text lines individually with tight bounding boxes and feathered edges
    // On 1024x768 image:
    // Line 1: "Certified that M/s" -> x: 320 to 520, y: 322 to 348
    // Line 2: "Address:" -> x: 320 to 420, y: 366 to 392
    // Line 3: "Has been duly admitted... is:" -> x: 318 to 960, y: 422 to 478

    const svgPatches = Buffer.from(`
      <svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="feather" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fffdf7" />
            <stop offset="100%" stop-color="#fef8ec" />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef7ea" />
            <stop offset="100%" stop-color="#fef4e3" />
          </linearGradient>
          <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef3e1" />
            <stop offset="100%" stop-color="#fcf0d9" />
          </linearGradient>
        </defs>
        <!-- Patch for Line 1 -->
        <rect x="320" y="322" width="200" height="26" fill="url(#g1)" rx="4" filter="url(#feather)" />
        <!-- Patch for Line 2 -->
        <rect x="320" y="366" width="100" height="26" fill="url(#g2)" rx="4" filter="url(#feather)" />
        <!-- Patch for Line 3 -->
        <rect x="316" y="420" width="646" height="60" fill="url(#g3)" rx="6" filter="url(#feather)" />
      </svg>
    `);

    const resultBuffer = await sharp(backupPath)
      .composite([
        {
          input: svgPatches,
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 98 })
      .toBuffer();

    fs.writeFileSync(path.join(pubDir, "certificate-gold-feather.jpg"), resultBuffer);

    return NextResponse.json({ success: true, message: "Created certificate-gold-feather.jpg" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
