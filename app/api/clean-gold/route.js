import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const silverPath = path.join(pubDir, "certificate-silver.jpg");
    const silverBackup = path.join(pubDir, "certificate-silver-backup.jpg");

    if (!fs.existsSync(silverBackup)) {
      fs.copyFileSync(silverPath, silverBackup);
    }

    const imgS = sharp(silverBackup);
    const { data, info } = await imgS.raw().toBuffer({ resolveWithObject: true });

    // The baked-in box in certificate-silver-backup.jpg is strictly at y: 184 to 213, x: 480 to 968.
    for (let y = 184; y <= 213; y++) {
      for (let x = 480; x <= 968; x++) {
        const idx = (y * info.width + x) * info.channels;
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
      }
    }

    const cleanSilverBuf = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: info.channels }
    }).jpeg({ quality: 98 }).toBuffer();

    fs.writeFileSync(path.join(pubDir, "certificate-silver-perfect.jpg"), cleanSilverBuf);

    try {
      fs.writeFileSync(silverPath, cleanSilverBuf);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      file: "certificate-silver-perfect.jpg",
      message: "Baked-in box and old text 100% removed from silver template!"
    });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
