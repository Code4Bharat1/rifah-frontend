import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const platSource = path.join(pubDir, "test-plat-cand1.jpg");
    const image = sharp(platSource);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // Look for dark pixels in the ENTIRE image
    let rowsWithDark = {};
    for (let y = 0; y < info.height; y++) {
      for (let x = 320; x < 900; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        if (r < 60 && g < 60 && b < 100) {
          rowsWithDark[y] = (rowsWithDark[y] || 0) + 1;
        }
      }
    }

    const yList = Object.keys(rowsWithDark).map(Number).sort((a,b)=>a-b);
    return NextResponse.json({
      success: true,
      minY: yList[0],
      maxY: yList[yList.length - 1],
      yRanges: yList.filter(y => rowsWithDark[y] > 10).slice(0, 30),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
