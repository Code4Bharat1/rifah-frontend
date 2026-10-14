import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const goldPath = path.join(pubDir, "certificate-gold.jpg");
    const goldBackup = path.join(pubDir, "certificate-gold-backup.jpg");
    const goldPerfect = path.join(pubDir, "certificate-gold-perfect.jpg");

    // 1. Ensure backup exists
    if (!fs.existsSync(goldBackup)) {
      fs.copyFileSync(goldPath, goldBackup);
    }

    // Always start from backup or current gold image
    const srcPath = fs.existsSync(goldBackup) ? goldBackup : goldPath;
    const img = sharp(srcPath);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width, h = info.height, ch = info.channels;

    // 2. Identify validity text ink pixels in x: 38..275, y: 618..670
    const valInk = new Uint8Array(w * h);
    for (let y = 618; y <= 670; y++) {
      for (let x = 38; x <= 275; x++) {
        const idx = (y * w + x) * ch;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        // Text ink is noticeably darker than clean parchment (parchment lum is > 237)
        if (lum < 225) {
          valInk[y * w + x] = 1;
        }
      }
    }

    // 3. Dilate the ink mask by 2px to completely catch subtle anti-aliased font edges
    const valDilated = new Uint8Array(w * h);
    for (let y = 616; y <= 672; y++) {
      for (let x = 36; x <= 277; x++) {
        if (valInk[y * w + x]) {
          for (let dy = -2; dy <= 2; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            for (let dx = -2; dx <= 2; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              valDilated[ny * w + nx] = 1;
            }
          }
        }
      }
    }

    // 4. Smooth vertical interpolation between row 616 (clean parchment) and row 672 (clean parchment)
    // Only dilated ink pixels are replaced. All surrounding paper fibers are untouched!
    let replacedCount = 0;
    const topY = 616;
    const botY = 672;
    for (let y = topY; y <= botY; y++) {
      const t = (y - topY) / (botY - topY);
      for (let x = 36; x <= 277; x++) {
        if (valDilated[y * w + x]) {
          const topIdx = (topY * w + x) * ch;
          const botIdx = (botY * w + x) * ch;
          const idx = (y * w + x) * ch;

          data[idx] = Math.round(data[topIdx] * (1 - t) + data[botIdx] * t);
          data[idx + 1] = Math.round(data[topIdx + 1] * (1 - t) + data[botIdx + 1] * t);
          data[idx + 2] = Math.round(data[topIdx + 2] * (1 - t) + data[botIdx + 2] * t);
          replacedCount++;
        }
      }
    }

    // 4B. Inpaint and remove the background metadata box completely (x: 450..994, y: 223..261)
    // Seamless vertical gradient from clean parchment row 220 down to clean parchment row 264
    const boxTopY = 220;
    const boxBotY = 264;
    let boxPixelsReplaced = 0;
    for (let y = 223; y <= 261; y++) {
      const t = (y - boxTopY) / (boxBotY - boxTopY);
      for (let x = 450; x <= 994; x++) {
        const topIdx = (boxTopY * w + x) * ch;
        const botIdx = (boxBotY * w + x) * ch;
        const idx = (y * w + x) * ch;

        data[idx] = Math.round(data[topIdx] * (1 - t) + data[botIdx] * t);
        data[idx + 1] = Math.round(data[topIdx + 1] * (1 - t) + data[botIdx + 1] * t);
        data[idx + 2] = Math.round(data[topIdx + 2] * (1 - t) + data[botIdx + 2] * t);
        boxPixelsReplaced++;
      }
    }

    // 5. Output clean JPEG with high quality
    const cleanGoldBuf = await sharp(data, {
      raw: { width: w, height: h, channels: ch },
    })
      .jpeg({ quality: 98 })
      .toBuffer();

    fs.writeFileSync(goldPerfect, cleanGoldBuf);
    fs.writeFileSync(goldPath, cleanGoldBuf);

    // 6. Post-verification: count dark pixels in validity area
    let remainingDark = 0;
    for (let y = 618; y <= 670; y++) {
      for (let x = 38; x <= 275; x++) {
        const idx = (y * w + x) * ch;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum < 200) remainingDark++;
      }
    }

    return NextResponse.json({
      success: true,
      replacedCount,
      boxPixelsReplaced,
      remainingDark,
      message: "Successfully inpainted validity text AND background meta box on certificate-gold.jpg and certificate-gold-perfect.jpg",
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
