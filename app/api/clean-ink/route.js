import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const backupPath = path.join(pubDir, "certificate-gold-backup.jpg");
    const outPath = path.join(pubDir, "certificate-gold-perfect.jpg");

    const image = sharp(backupPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;
    const ch = info.channels;

    // We only want to remove text ink inside the body area:
    // x: 300 to 960, y: 310 to 490
    // A pixel is text ink if it is significantly darker than parchment:
    // Parchment in this area has R > 235, G > 220, B > 200.
    // Text ink has R < 140, G < 140, B < 140.

    // 1. Identify all ink mask pixels
    const isInk = new Uint8Array(w * h);
    for (let y = 310; y <= 490; y++) {
      for (let x = 300; x <= 960; x++) {
        const idx = (y * w + x) * ch;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 185) {
          isInk[y * w + x] = 1;
        }
      }
    }

    // Dilate the ink mask by 2 pixels to catch anti-aliased edge halos
    const dilatedInk = new Uint8Array(w * h);
    for (let y = 310; y <= 490; y++) {
      for (let x = 300; x <= 960; x++) {
        if (isInk[y * w + x]) {
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              dilatedInk[(y + dy) * w + (x + dx)] = 1;
            }
          }
        }
      }
    }

    // 2. For each dilated ink pixel, replace with average of surrounding non-ink parchment pixels
    for (let y = 308; y <= 492; y++) {
      for (let x = 298; x <= 962; x++) {
        if (dilatedInk[y * w + x]) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          // Look above and below (vertical radius 6..14) where parchment is clean
          for (let dy = -12; dy <= 12; dy++) {
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

          if (count > 0) {
            const idx = (y * w + x) * ch;
            data[idx] = Math.round(sumR / count);
            data[idx + 1] = Math.round(sumG / count);
            data[idx + 2] = Math.round(sumB / count);
          }
        }
      }
    }

    // Save as certificate-gold-perfect.jpg and copy to certificate-gold.jpg
    const finalBuffer = await sharp(data, {
      raw: { width: w, height: h, channels: ch },
    })
      .jpeg({ quality: 97 })
      .toBuffer();

    fs.writeFileSync(outPath, finalBuffer);
    fs.writeFileSync(path.join(pubDir, "certificate-gold.jpg"), finalBuffer);

    return NextResponse.json({ success: true, message: "Perfect ink removal completed!" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
