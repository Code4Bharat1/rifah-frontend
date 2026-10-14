import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const pubDir = path.join(process.cwd(), "public");
  const files = fs.readdirSync(pubDir).map(f => {
    const s = fs.statSync(path.join(pubDir, f));
    return { name: f, size: s.size, mtime: s.mtime };
  });
  return NextResponse.json({ cwd: process.cwd(), files });
}
