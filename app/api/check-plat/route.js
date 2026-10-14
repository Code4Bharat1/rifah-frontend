import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const platCurrentPath = path.join(pubDir, "certificate-platinum.jpg");
    const refPath = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\.tempmediaStorage\\media_1791635372929.jpg";

    const hasRef = fs.existsSync(refPath);
    let refMeta = null;
    if (hasRef) {
      refMeta = await sharp(refPath).metadata();
    }
    const currentMeta = await sharp(platCurrentPath).metadata();

    return NextResponse.json({
      hasRef,
      refMeta: refMeta ? { width: refMeta.width, height: refMeta.height } : null,
      currentMeta: { width: currentMeta.width, height: currentMeta.height },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
