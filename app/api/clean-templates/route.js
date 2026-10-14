import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function inpaintImage(data, w, h, ch, regions) {
  // regions is array of { x1, y1, x2, y2, lumThreshold }
  const isInk = new Uint8Array(w * h);

  for (const reg of regions) {
    const { x1, y1, x2, y2, lumThreshold = 185 } = reg;
    for (let y = y1; y <= y2; y++) {
      if (y < 0 || y >= h) continue;
      for (let x = x1; x <= x2; x++) {
        if (x < 0 || x >= w) continue;
        const idx = (y * w + x) * ch;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < lumThreshold) {
          isInk[y * w + x] = 1;
        }
      }
    }
  }

  // Dilate mask by 2px
  const dilatedInk = new Uint8Array(w * h);
  for (const reg of regions) {
    const { x1, y1, x2, y2 } = reg;
    for (let y = Math.max(0, y1 - 2); y <= Math.min(h - 1, y2 + 2); y++) {
      for (let x = Math.max(0, x1 - 2); x <= Math.min(w - 1, x2 + 2); x++) {
        if (isInk[y * w + x]) {
          for (let dy = -2; dy <= 2; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            for (let dx = -2; dx <= 2; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              dilatedInk[ny * w + nx] = 1;
            }
          }
        }
      }
    }
  }

  // Inpaint: sample above & below
  for (const reg of regions) {
    const { x1, y1, x2, y2 } = reg;
    for (let y = Math.max(0, y1 - 3); y <= Math.min(h - 1, y2 + 3); y++) {
      for (let x = Math.max(0, x1 - 3); x <= Math.min(w - 1, x2 + 3); x++) {
        if (dilatedInk[y * w + x]) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          for (let dy = -14; dy <= 14; dy++) {
            if (Math.abs(dy) < 3) continue;
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            if (!dilatedInk[ny * w + x]) {
              const nidx = (ny * w + x) * ch;
              sumR += data[nidx];
              sumG += data[nidx + 1];
              sumB += data[nidx + 2];
              count++;
            }
          }

          // Fallback to horizontal if vertical was blocked
          if (count === 0) {
            for (let dx = -14; dx <= 14; dx++) {
              if (Math.abs(dx) < 3) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              if (!dilatedInk[y * w + nx]) {
                const nidx = (y * w + nx) * ch;
                sumR += data[nidx];
                sumG += data[nidx + 1];
                sumB += data[nidx + 2];
                count++;
              }
            }
          }

          if (count > 0) {
            const idx = (y * w + x) * ch;
            data[idx] = Math.round(sumR / count);
            data[idx + 1] = Math.round(sumG / count);
            data[idx + 2] = Math.round(sumB / count);
          }
        }
      }
    }
  }
}

function safeWrite(filePath, buffer) {
  try {
    fs.writeFileSync(filePath, buffer);
    return { ok: true, file: path.basename(filePath), bytes: buffer.length };
  } catch (err) {
    return { ok: false, file: path.basename(filePath), error: err.message };
  }
}

export async function GET() {
  const pubDir = path.join(process.cwd(), "public");
  const results = {};

  try {
    // 1. Process GOLD
    const goldBackup = path.join(pubDir, "certificate-gold-backup.jpg");
    if (fs.existsSync(goldBackup)) {
      const img = sharp(goldBackup);
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

      // Body text is strictly between y: 310 and 505, x: 300 and 955.
      // The metallic ribbon starts at y > 520, so y2: 505 leaves the ribbon 100% pristine.
      // Validity text is strictly at bottom-left: x: 30..220, y: 570..650.
      inpaintImage(data, info.width, info.height, info.channels, [
        { x1: 300, y1: 310, x2: 955, y2: 505, lumThreshold: 185 },
        { x1: 30, y1: 570, x2: 220, y2: 650, lumThreshold: 200 },
      ]);
      const goldBuf = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: info.channels },
      }).jpeg({ quality: 98 }).toBuffer();

      results.writeGoldPerfect = safeWrite(path.join(pubDir, "certificate-gold-perfect.jpg"), goldBuf);
      try {
        fs.writeFileSync(path.join(pubDir, "certificate-gold.jpg"), goldBuf);
        results.goldJpgCopied = true;
      } catch (e) {
        results.goldJpgCopied = e.message;
      }
    }

    // 2. Process PLATINUM
    const platSource = path.join(pubDir, "test-plat-cand1.jpg");
    if (fs.existsSync(platSource)) {
      const img = sharp(platSource);
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
      inpaintImage(data, info.width, info.height, info.channels, [
        { x1: 270, y1: 275, x2: 975, y2: 560, lumThreshold: 220 },
        { x1: 20, y1: 580, x2: 260, y2: 700, lumThreshold: 220 },
      ]);
      // Clear stray d pixel region directly with surrounding white:
      for (let y = 380; y <= 450; y++) {
        for (let x = 960; x <= 995; x++) {
          const idx = (y * info.width + x) * info.channels;
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
        }
      }
      const platBuf = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: info.channels },
      }).jpeg({ quality: 97 }).toBuffer();

      results.writePlatPerfect = safeWrite(path.join(pubDir, "certificate-platinum-perfect.jpg"), platBuf);
      try {
        fs.writeFileSync(path.join(pubDir, "certificate-platinum.jpg"), platBuf);
        results.platJpgCopied = true;
      } catch (e) {
        results.platJpgCopied = e.message;
      }
    }

    // 3. Process DIAMOND
    const diamondSrc = path.join(pubDir, "test-cand4.jpg");
    if (fs.existsSync(diamondSrc)) {
      const img = sharp(diamondSrc);
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
      inpaintImage(data, info.width, info.height, info.channels, [
        { x1: 280, y1: 280, x2: 975, y2: 565, lumThreshold: 220 },
        { x1: 20, y1: 580, x2: 260, y2: 700, lumThreshold: 220 },
      ]);
      const diamondBuf = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: info.channels },
      }).jpeg({ quality: 97 }).toBuffer();

      results.writeDiamondPerfect = safeWrite(path.join(pubDir, "certificate-diamond-perfect.jpg"), diamondBuf);
      try {
        fs.writeFileSync(path.join(pubDir, "certificate-diamond.jpg"), diamondBuf);
        fs.writeFileSync(path.join(pubDir, "certificate-diamond.png"), diamondBuf);
        results.diamondJpgCopied = true;
      } catch (e) {
        results.diamondJpgCopied = e.message;
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
