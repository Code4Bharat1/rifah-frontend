import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cwd = process.cwd();
    const gitCmd = '"C:\\Program Files\\Git\\bin\\git.exe"';
    const scratchDir = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\scratch";

    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    const files = [
      "modules/admin/components/admin-businesses.jsx",
      "modules/admin/components/admin-settings.jsx",
      "modules/admin/components/operations-center/operations-center.jsx",
      "modules/workspace/components/biz-membership.jsx",
    ];

    const results = {};
    for (const f of files) {
      const base = path.basename(f, path.extname(f));
      // 1. What origin/main has vs HEAD
      const diffCommit = execSync(`${gitCmd} diff -U3 HEAD origin/main -- "${f}"`, { cwd, encoding: "utf-8" });
      fs.writeFileSync(path.join(scratchDir, `${base}-origin-diff.patch`), diffCommit, "utf-8");

      // 2. What working tree has vs HEAD
      const diffLocal = execSync(`${gitCmd} diff -U3 HEAD -- "${f}"`, { cwd, encoding: "utf-8" });
      fs.writeFileSync(path.join(scratchDir, `${base}-local-diff.patch`), diffLocal, "utf-8");

      // 3. Dump the origin/main version of the file
      try {
        const originContent = execSync(`${gitCmd} show origin/main:"${f}"`, { cwd, encoding: "utf-8" });
        fs.writeFileSync(path.join(scratchDir, `${base}-origin.jsx`), originContent, "utf-8");
      } catch (e) {
        // ignore
      }

      results[base] = {
        originDiffLen: diffCommit.length,
        localDiffLen: diffLocal.length,
      };
    }

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ error: e.message });
  }
}
