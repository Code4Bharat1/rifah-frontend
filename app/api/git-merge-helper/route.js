import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");

    // Ensure silver perfect exists
    const silverSrc = path.join(pubDir, "certificate-silver.jpg");
    const silverDst = path.join(pubDir, "certificate-silver-perfect.jpg");
    if (fs.existsSync(silverSrc) && !fs.existsSync(silverDst)) {
      fs.copyFileSync(silverSrc, silverDst);
    }

    // Ensure all variants exist for all 4 tiers
    const templates = [
      "certificate-silver-perfect.jpg",
      "certificate-silver.jpg",
      "certificate-gold-perfect.jpg",
      "certificate-gold.jpg",
      "certificate-platinum-perfect.jpg",
      "certificate-platinum.jpg",
      "certificate-diamond-perfect.jpg",
      "certificate-diamond.jpg",
      "certificate-diamond.png",
    ];

    const status = {};
    for (const t of templates) {
      const p = path.join(pubDir, t);
      status[t] = {
        exists: fs.existsSync(p),
        size: fs.existsSync(p) ? fs.statSync(p).size : 0,
      };
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
