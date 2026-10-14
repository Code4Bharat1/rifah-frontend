import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const basePath = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\.tempmediaStorage";
    const silver = await sharp(path.join(basePath, "media_1791635352160.jpg")).metadata();
    const gold = await sharp(path.join(basePath, "media_1791635388371.jpg")).metadata();
    const plat = await sharp(path.join(basePath, "media_1791635372929.jpg")).metadata();
    const diamond = await sharp(path.join(basePath, "media_1791635381273.jpg")).metadata();

    const pubDir = path.join(process.cwd(), "public");
    const pubFiles = fs.readdirSync(pubDir).filter(f => f.includes("cert"));

    return NextResponse.json({
      silver: { width: silver.width, height: silver.height },
      gold: { width: gold.width, height: gold.height },
      plat: { width: plat.width, height: plat.height },
      diamond: { width: diamond.width, height: diamond.height },
      pubFiles
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
