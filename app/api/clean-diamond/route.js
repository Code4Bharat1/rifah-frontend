import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

function inpaintTextInk(data, w, h, ch, bounds, lumThreshold = 180) {
  const { minX, maxX, minY, maxY } = bounds;
  const isInk = new Uint8Array(w * h);

  // 1. Detect ink pixels
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = (y * w + x) * ch;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const isRedText = (r > 110 && g < 60 && b < 70);
      const isDarkInk = (lum < lumThreshold);
      if (isDarkInk || isRedText) {
        isInk[y * w + x] = 1;
      }
    }
  }

  // 2. Dilate ink mask by 2px to catch anti-aliasing edges
  const dilated = new Uint8Array(w * h);
  for (let y = minY - 2; y <= maxY + 2; y++) {
    if (y < 0 || y >= h) continue;
    for (let x = minX - 2; x <= maxX + 2; x++) {
      if (x < 0 || x >= w) continue;
      if (isInk[y * w + x]) {
        for (let dy = -2; dy <= 2; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;
            dilated[ny * w + nx] = 1;
          }
        }
      }
    }
  }

  // 3. Inpaint ONLY dilated ink pixels by sampling clean background vertically above & below
  for (let y = minY - 2; y <= maxY + 2; y++) {
    if (y < 0 || y >= h) continue;
    for (let x = minX - 2; x <= maxX + 2; x++) {
      if (x < 0 || x >= w) continue;
      if (dilated[y * w + x]) {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        for (let dy = -16; dy <= 16; dy++) {
          if (Math.abs(dy) < 3) continue;
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          if (!dilated[ny * w + x]) {
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
}

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), "public");
    const diamondSrc = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\.tempmediaStorage\\media_1791635381273.jpg";

    if (!fs.existsSync(diamondSrc)) {
      return NextResponse.json({ error: "Diamond source not found: " + diamondSrc });
    }

    const img = sharp(diamondSrc);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width, h = info.height, ch = info.channels;

    // Surgical line-by-line text removal:
    // ROSETTE PROTECTION: minX is strictly 304! Rosette ribbon is at x <= 295. Zero rosette damage.

    // 1. Line 1: "Certified that M/s Aziz Construction" (y: 282..322, x: 304..760)
    inpaintTextInk(data, w, h, ch, { minX: 304, maxX: 760, minY: 282, maxY: 322 }, 185);

    // 2. Line 2: "Address: Delux Colony, 8-1-364/54..." (y: 330..396, x: 304..972)
    inpaintTextInk(data, w, h, ch, { minX: 304, maxX: 972, minY: 330, maxY: 396 }, 185);

    // 3. Line 3: "Has been duly admitted as a Member..." (y: 405..472, x: 304..955)
    inpaintTextInk(data, w, h, ch, { minX: 304, maxX: 955, minY: 405, maxY: 472 }, 185);

    // 4. Line 4: "Adv. Syed Abdul Wasey" (y: 480..532, x: 304..645)
    // STRICTLY maxX=645 so signatures at y>535 and steel corner at x>850 are 100% UNTOUCHED!
    inpaintTextInk(data, w, h, ch, { minX: 304, maxX: 645, minY: 480, maxY: 532 }, 185);

    // 5. Validity Text: "This Certificate is / Valid upto: 02/07/2027" (y: 602..644, x: 34..230)
    const valInk = new Uint8Array(w * h);
    for (let y = 602; y <= 644; y++) {
      for (let x = 34; x <= 230; x++) {
        const idx = (y * w + x) * ch;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum < 220) {
          valInk[y * w + x] = 1;
        }
      }
    }
    const valDilated = new Uint8Array(w * h);
    for (let y = 600; y <= 646; y++) {
      for (let x = 32; x <= 232; x++) {
        if (valInk[y * w + x]) {
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              valDilated[(y + dy) * w + (x + dx)] = 1;
            }
          }
        }
      }
    }
    for (let y = 600; y <= 646; y++) {
      const t = (y - 598) / (648 - 598);
      for (let x = 32; x <= 232; x++) {
        if (valDilated[y * w + x]) {
          const topIdx = (598 * w + x) * ch;
          const botIdx = (648 * w + x) * ch;
          const idx = (y * w + x) * ch;
          data[idx] = Math.round(data[topIdx] * (1 - t) + data[botIdx] * t);
          data[idx + 1] = Math.round(data[topIdx + 1] * (1 - t) + data[botIdx + 1] * t);
          data[idx + 2] = Math.round(data[topIdx + 2] * (1 - t) + data[botIdx + 2] * t);
        }
      }
    }

    // 6. Meta Box: "Membership ID: 1801TS" & "Date of Issue: 03/07/2025" (y: 222..248, x: 446..955)
    // Seamlessly blend using vertical gradient matching original silver-blue metallic background
    for (let y = 222; y <= 248; y++) {
      const t = (y - 222) / (248 - 222);
      // Sample clean metallic box colors: top is r:213, g:221, b:234; bottom is r:208, g:216, b:230
      const gr = Math.round(214 - 6 * t);
      const gg = Math.round(222 - 6 * t);
      const gb = Math.round(236 - 6 * t);
      for (let x = 446; x <= 955; x++) {
        const idx = (y * w + x) * ch;
        data[idx] = gr;
        data[idx + 1] = gg;
        data[idx + 2] = gb;
      }
    }

    const cleanJpg = await sharp(data, {
      raw: { width: w, height: h, channels: ch },
    }).jpeg({ quality: 98 }).toBuffer();

    const cleanPng = await sharp(data, {
      raw: { width: w, height: h, channels: ch },
    }).png({ compressionLevel: 7 }).toBuffer();

    fs.writeFileSync(path.join(pubDir, "certificate-diamond.png"), cleanPng);
    fs.writeFileSync(path.join(pubDir, "certificate-diamond.jpg"), cleanJpg);
    fs.writeFileSync(path.join(pubDir, "certificate-diamond-perfect.jpg"), cleanJpg);
    fs.copyFileSync(diamondSrc, path.join(pubDir, "diamond-reference.jpg"));

    return NextResponse.json({
      success: true,
      files: [
        "certificate-diamond.png",
        "certificate-diamond.jpg",
        "certificate-diamond-perfect.jpg",
        "diamond-reference.jpg"
      ],
      pngBytes: cleanPng.length,
      jpgBytes: cleanJpg.length,
      message: "Surgical Diamond template generated: ZERO rosette damage, ZERO steel damage, ZERO double box!"
    });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
