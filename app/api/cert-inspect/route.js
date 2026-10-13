import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";

export async function GET() {
  try {
    const goldPath = path.join(process.cwd(), "public", "certificate-gold.jpg");
    const meta = await sharp(goldPath).metadata();
    return NextResponse.json({ success: true, meta });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
