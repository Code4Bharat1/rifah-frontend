import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { generateCertificateHtml, resolveCertificateRepresentativeName } = await import("@shared/lib/certificate-generator");

    const sampleBusinesses = [
      {
        name: "Siddiqui Fine Textiles & Garments",
        membershipId: "RCCI/MH/0001",
        contactPerson: "",
        owner: { name: "Amina Siddiqui", designation: "Founder / Owner" },
        tier: "silver",
      },
      {
        name: "Ansari Precision Engineering Works",
        membershipId: "RCCI/MH/0002",
        contactPerson: "",
        owner: { name: "Tariq Ansari", designation: "Founder / Owner" },
        tier: "gold",
      },
      {
        name: "Al-Barakah Logistics Solutions",
        membershipId: "RCCI/MH/0003",
        contactPerson: "Zubair Khan",
        owner: { name: "Zubair Khan" },
        tier: "platinum",
      },
      {
        name: "TATA Power Enterprise",
        membershipId: "RCCI/MH/0004",
        contactPerson: "",
        owner: { name: "Adv. Syed Abdul Wasey" },
        tier: "diamond",
      },
    ];

    const results = sampleBusinesses.map((biz) => {
      const repName = resolveCertificateRepresentativeName(biz);
      const html = generateCertificateHtml(biz, null, { tier: biz.tier });
      const hasRepNameInHtml = html.includes(repName);
      const hasRajSharma = /raj\s*sharma/i.test(html);
      return {
        tier: biz.tier,
        businessName: biz.name,
        resolvedRepName: repName,
        hasRepNameInHtml,
        hasRajSharma,
      };
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
