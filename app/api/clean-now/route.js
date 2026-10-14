import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const backupPath = path.join(pubDir, "certificate-gold-backup.jpg");
    const outPath = path.join(pubDir, "test-cleaned-now.jpg");

    const image = sharp(backupPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // Let's replace y = 300 to 520, x = 300 to 965 with parchment color:
    // For each pixel, sample from left (x=295) and right (x=975)
    for (let y = 300; y <= 525; y++) {
      const idxL = (y * info.width + 295) * info.channels;
      const idxR = (y * info.width + 975) * info.channels;

      const rL = data[idxL], gL = data[idxL + 1], bL = data[idxL + 2];
      const rR = data[idxR], gR = data[idxR + 1], bR = data[idxR + 2];

      for (let x = 300; x <= 970; x++) {
        const factor = (x - 300) / (970 - 300);
        const idx = (y * info.width + x) * info.channels;
        data[idx] = Math.round(rL + (rR - rL) * factor);
        data[idx + 1] = Math.round(gL + (gR - gL) * factor);
        data[idx + 2] = Math.round(bL + (bR - bL) * factor);
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels,
      },
    })
      .jpeg({ quality: 96 })
      .toFile(outPath);

    return NextResponse.json({ success: true, file: outPath });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
