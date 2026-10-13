import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const platSource = path.join(pubDir, "test-plat-cand1.jpg");
    const platDest = path.join(pubDir, "certificate-platinum.jpg");

    // Pure white patch covering y: 385 to 645, x: 280 to 970
    const svgPatch = Buffer.from(`
      <svg width="690" height="260">
        <rect width="690" height="260" fill="#ffffff" />
      </svg>
    `);

    const resultBuffer = await sharp(platSource)
      .composite([
        {
          input: svgPatch,
          top: 385,
          left: 280,
        },
      ])
      .jpeg({ quality: 98 })
      .toBuffer();

    fs.writeFileSync(platDest, resultBuffer);

    return NextResponse.json({ success: true, message: "Pristine white platinum template generated!" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
