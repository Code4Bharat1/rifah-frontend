import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diamondPath = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1f6988f7-ff98-463d-a7ea-5c2a0b4407d8\\.tempmediaStorage\\media_1791635381273.jpg";
    const image = sharp(diamondPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // 1. Body text (x: 290..980, y: 270..550)
    let bodyMinX = info.width, bodyMaxX = 0, bodyMinY = info.height, bodyMaxY = 0, bodyCount = 0;
    for (let y = 270; y < 550; y++) {
      for (let x = 290; x < 980; x++) {
        const idx = (y * info.width + x) * info.channels;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum < 185) {
          if (x < bodyMinX) bodyMinX = x;
          if (x > bodyMaxX) bodyMaxX = x;
          if (y < bodyMinY) bodyMinY = y;
          if (y > bodyMaxY) bodyMaxY = y;
          bodyCount++;
        }
      }
    }

    // 2. Meta box (y: 200..260, x: 430..990)
    let metaMinX = info.width, metaMaxX = 0, metaMinY = info.height, metaMaxY = 0, metaCount = 0;
    for (let y = 200; y <= 260; y++) {
      for (let x = 430; x <= 990; x++) {
        const idx = (y * info.width + x) * info.channels;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum < 200) {
          if (x < metaMinX) metaMinX = x;
          if (x > metaMaxX) metaMaxX = x;
          if (y < metaMinY) metaMinY = y;
          if (y > metaMaxY) metaMaxY = y;
          metaCount++;
        }
      }
    }

    // 3. Validity (x: 30..250, y: 580..680)
    let valMinX = info.width, valMaxX = 0, valMinY = info.height, valMaxY = 0, valCount = 0;
    for (let y = 580; y <= 680; y++) {
      for (let x = 30; x <= 250; x++) {
        const idx = (y * info.width + x) * info.channels;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum < 180) {
          if (x < valMinX) valMinX = x;
          if (x > valMaxX) valMaxX = x;
          if (y < valMinY) valMinY = y;
          if (y > valMaxY) valMaxY = y;
          valCount++;
        }
      }
    }

    return NextResponse.json({
      width: info.width,
      height: info.height,
      body: { minX: bodyMinX, maxX: bodyMaxX, minY: bodyMinY, maxY: bodyMaxY, count: bodyCount },
      meta: { minX: metaMinX, maxX: metaMaxX, minY: metaMinY, maxY: metaMaxY, count: metaCount },
      validity: { minX: valMinX, maxX: valMaxX, minY: valMinY, maxY: valMaxY, count: valCount },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
