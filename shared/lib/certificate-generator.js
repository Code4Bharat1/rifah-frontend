// Official RIFAH Chamber of Commerce Membership Certificate Generator
// Replicates the exact designs for all 4 Membership Tiers: Silver, Platinum, Diamond, Gold
// Guarantees ZERO duplicate labels, ZERO duplicate boxes, and supports Central Admin customizations
import { formatMembershipId } from "./indian-states-cities.js";

export const DEFAULT_CERTIFICATE_SETTINGS = {
  signatory1: {
    name: "S AMEENUL HASAN",
    title: "(Chairman)",
    signatureUrl: "", // If empty, uses official default artwork
  },
  signatory2: {
    name: "MIRZA AFZAL BAIG",
    title: "(General Secretary)",
    signatureUrl: "", // If empty, uses official default artwork
  },
  admissionText:
    "Has been duly admitted as a Member of the Rifah Chamber of Commerce and Industry. The authorized representative of the organization, as stated in the membership application, is:",
  registeredOffice:
    "Flat No. 4 C & D, 1st Floor, Plot No. 96, 77C, Hamid Building, Mominpura, Jacob Circle, Byculla West, Mumbai – 400011, Maharashtra",
  contactPhone: "+91-8097781851",
  contactEmail: "office@rifah.org",
  website: "www.rifah.org",
  tiers: {
    silver: {
      badgeName: "SILVER",
      accentColor: "#c01e1e",
      templateUrl: "/certificate-silver-perfect.jpg",
    },
    gold: {
      badgeName: "GOLD",
      accentColor: "#8b1d1d",
      templateUrl: "/certificate-gold.jpg",
    },
    platinum: {
      badgeName: "PLATINUM",
      accentColor: "#102a45",
      templateUrl: "/certificate-platinum-perfect.jpg",
    },
    diamond: {
      badgeName: "DIAMOND",
      accentColor: "#004b87",
      templateUrl: "/certificate-diamond.png",
    },
  },
};

export function printDocumentInPage(html) {
  if (typeof window === "undefined") return;

  const existingFrame = document.getElementById("rifah-hidden-print-frame");
  if (existingFrame) {
    try {
      existingFrame.remove();
    } catch (e) {
      // Ignore removal error
    }
  }

  const iframe = document.createElement("iframe");
  iframe.id = "rifah-hidden-print-frame";
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "10px";
  iframe.style.height = "10px";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    const triggerPrint = () => {
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
      } catch (e) {
        console.error("In-page printing error:", e);
      }
    };

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready
        .then(() => {
          setTimeout(triggerPrint, 250);
        })
        .catch(() => {
          setTimeout(triggerPrint, 350);
        });
    } else {
      setTimeout(triggerPrint, 350);
    }
  } catch (err) {
    console.error("Failed to prepare print iframe:", err);
  }
}

export function formatCertificateAddress(business) {
  if (!business) return "Mumbai, Maharashtra";

  let raw = "";
  const candidate = (business.fullAddress || business.address || "").trim();
  const city = (business.city || "").trim();
  const state = (business.state || "").trim();
  const country = (business.country || "").trim();
  const pincode = String(business.pincode || business.postalCode || "").trim();
  const street = (business.street || "").trim();
  const area = (business.area || "").trim();

  // If candidate is empty or just a single generic word like "Dubai", reconstruct from available parts
  if (
    !candidate ||
    (candidate.toLowerCase() === city.toLowerCase() && !candidate.includes(",")) ||
    (candidate.toLowerCase() === state.toLowerCase() && !candidate.includes(","))
  ) {
    const parts = [street, area, city, pincode, state, country].filter(Boolean);
    raw = parts.join(", ");
  } else {
    raw = candidate;
    // If country is specified but missing from the raw string, append cleanly
    if (country && !raw.toLowerCase().includes(country.toLowerCase())) {
      raw += `, ${country}`;
    }
  }

  if (!raw) {
    return "Mumbai, Maharashtra";
  }

  let text = String(raw).trim();

  // 1. Remove dummy / placeholder zeros or 'ooooo' (e.g., 00000, 000000, ooooo, OOOOO)
  text = text.replace(/\b[0oO]{4,6}\b/g, "");

  // 2. Normalize concatenated country names
  text = text
    .replace(/UnitedArabEmirates/gi, "United Arab Emirates")
    .replace(/SaudiArabia/gi, "Saudi Arabia")
    .replace(/UnitedStates/gi, "United States")
    .replace(/UnitedKingdom/gi, "United Kingdom")
    .replace(/NewZealand/gi, "New Zealand")
    .replace(/SouthAfrica/gi, "South Africa");

  // 3. Separate squished CamelCase words (e.g. DubaiUnited -> Dubai United)
  text = text.replace(/([a-z])([A-Z])/g, "$1 $2");

  // 4. Separate squished digits and letters (e.g. Hyderabad500008 -> Hyderabad 500008)
  text = text.replace(/([a-zA-Z])([0-9])/g, "$1 $2");
  text = text.replace(/([0-9])([a-zA-Z])/g, "$1 $2");

  // 5. Ensure comma between City and Country if missing (e.g. "Dubai United Arab Emirates" -> "Dubai, United Arab Emirates")
  text = text
    .replace(/Dubai\s+United\s+Arab\s+Emirates/gi, "Dubai, United Arab Emirates")
    .replace(/Abu\s+Dhabi\s+United\s+Arab\s+Emirates/gi, "Abu Dhabi, United Arab Emirates")
    .replace(/Sharjah\s+United\s+Arab\s+Emirates/gi, "Sharjah, United Arab Emirates")
    .replace(/Ajman\s+United\s+Arab\s+Emirates/gi, "Ajman, United Arab Emirates")
    .replace(/Doha\s+Qatar/gi, "Doha, Qatar")
    .replace(/Riyadh\s+Saudi\s+Arabia/gi, "Riyadh, Saudi Arabia")
    .replace(/Jeddah\s+Saudi\s+Arabia/gi, "Jeddah, Saudi Arabia")
    .replace(/Kuwait\s+City\s+Kuwait/gi, "Kuwait City, Kuwait")
    .replace(/Manama\s+Bahrain/gi, "Manama, Bahrain")
    .replace(/Muscat\s+Oman/gi, "Muscat, Oman");

  // 6. Handle Indian city / state / pincode comma placement if missed (e.g., "Hyderabad 500008 Telangana" -> "Hyderabad, 500008, Telangana")
  text = text.replace(/([a-zA-Z]+)\s+([0-9]{6})\s+([a-zA-Z]+)/g, "$1, $2, $3");

  // 7. Deduplicate tokens (e.g. "Dubai, Dubai, United Arab Emirates" -> "Dubai, United Arab Emirates")
  const tokens = text.split(/,\s*/).map((t) => t.trim()).filter(Boolean);
  const seen = new Set();
  const dedupedTokens = [];
  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      dedupedTokens.push(t);
    }
  }

  let result = dedupedTokens.join(", ");

  // 8. If string has no commas at all, try to place comma after city if known
  if (!result.includes(",")) {
    if (city && (country || state)) {
      const rest = country || state;
      const re = new RegExp(`^${city}\\s+${rest}$`, "i");
      if (re.test(result)) {
        result = `${city}, ${rest}`;
      }
    }
  }

  // 9. Final punctuation and spacing cleanup
  result = result
    .replace(/\s*,\s*/g, ", ")
    .replace(/,\s*,+/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/^,\s*/, "")
    .replace(/,\s*$/, "")
    .trim();

  return result || "Mumbai, Maharashtra";
}

function formatCertificateDate(dateInput, defaultFormatted) {
  if (!dateInput) return defaultFormatted;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return defaultFormatted;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getTierDesign(rawTier = "diamond", origin = "", customSettings = null) {
  const norm = String(rawTier || "").toLowerCase().trim();

  let tierKey = "diamond";
  if (norm.includes("silver")) tierKey = "silver";
  else if (norm.includes("gold")) tierKey = "gold";
  else if (norm.includes("platinum")) tierKey = "platinum";
  else tierKey = "diamond";

  const fallbackTiers = DEFAULT_CERTIFICATE_SETTINGS?.tiers || {};
  const tierConfig = customSettings?.tiers?.[tierKey] || fallbackTiers[tierKey] || {};
  const tierLabel = String(
    tierConfig?.badgeName ||
    (tierKey.charAt(0).toUpperCase() + tierKey.slice(1)) ||
    "Diamond"
  );

  let rawUrl = tierConfig?.templateUrl || `/certificate-${tierKey}.png`;
  let templateUrl = rawUrl.startsWith("http") || rawUrl.startsWith("data:") ? rawUrl : `${origin}${rawUrl}`;

  const accentColor = tierConfig?.accentColor || (
    tierKey === "diamond" ? "#004b87" :
    tierKey === "platinum" ? "#102a45" :
    tierKey === "gold" ? "#8b1d1d" : "#c01e1e"
  );

  const metaBoxBorder =
    tierKey === "gold" ? "1.2px solid #b45309" :
    tierKey === "platinum" ? "1.2px solid #4a6fa5" :
    tierKey === "silver" ? "1.2px solid #8c97a4" :
    "none";

  const metaBoxBg =
    tierKey === "gold" ? "linear-gradient(180deg, #fefce8 0%, #ffffff 50%, #fef3c7 100%)" :
    tierKey === "platinum" ? "linear-gradient(180deg, #f0f4f8 0%, #ffffff 50%, #e2e8f0 100%)" :
    tierKey === "silver" ? "linear-gradient(180deg, #edf1f5 0%, #ffffff 50%, #e2e7ec 100%)" :
    "transparent";

  const metaBoxLeft = tierKey === "silver" ? "468px" : tierKey === "platinum" ? "444px" : "442px";
  const metaBoxTop = tierKey === "silver" ? "182px" : tierKey === "platinum" ? "207px" : "215px";
  const metaBoxWidth = tierKey === "silver" ? "485px" : tierKey === "platinum" ? "524px" : "500px";
  const metaBoxHeight = tierKey === "silver" ? "34px" : tierKey === "platinum" ? "34px" : "28px";
  const metaBoxShadow = tierKey === "diamond" ? "none" : "inset 0 1px 2px rgba(255, 255, 255, 0.85), 0 2px 4px rgba(0, 0, 0, 0.15)";

  const bodyBg = "transparent";
  const bodyShadow = "none";
  const validityBg = "transparent";
  const validityShadow = "none";
  const validityLeft = tierKey === "diamond" ? "36px" : "40px";
  const validityTop = tierKey === "diamond" ? "575px" : "565px";
  const sigSlotBg =
    tierKey === "gold" ? "#fdfbf4" :
    tierKey === "platinum" ? "#ffffff" :
    tierKey === "silver" ? "#ffffff" :
    "#ffffff";

  const officeBg =
    tierKey === "gold" ? "#fbf5e5" :
    tierKey === "platinum" ? "#eef3f8" :
    tierKey === "silver" ? "#f3f5f8" :
    "#ffffff";

  return {
    tierKey,
    tierLabel,
    templateUrl,
    width: 1000,
    height: 705,
    accentColor,
    metaBoxBorder,
    metaBoxBg,
    metaBoxLeft,
    metaBoxTop,
    metaBoxWidth,
    metaBoxHeight,
    bodyBg,
    bodyShadow,
    validityBg,
    validityShadow,
    validityLeft,
    validityTop,
    sigSlotBg,
    officeBg,
  };
}

export function generateCertificateHtml(business, membershipData = null, options = {}) {
  if (!business) return "";

  const { isPreview = false, autoprint = false, isExport = false, customSettings = null } = options;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // Extract membership tier dynamically
  const rawTier =
    options.tier ||
    membershipData?.planName ||
    membershipData?.tier ||
    membershipData?.planId ||
    business?.membershipTier ||
    business?.membership ||
    business?.membershipPlan ||
    business?.tier ||
    "diamond";

  const tierDesign = getTierDesign(rawTier, origin, customSettings);
  const {
    width: certW,
    height: certH,
    templateUrl,
    accentColor,
    tierLabel,
    tierKey,
    metaBoxBorder,
    metaBoxBg,
    bodyBg,
    bodyShadow,
    validityBg,
    validityShadow,
    sigSlotBg,
    officeBg,
  } = tierDesign;

  const businessName = business.name || "Business Enterprise";
  const memberId = formatMembershipId(
    business.membershipId,
    business.state,
    business.chapter,
    business.city
  );

  const issueDateFormatted = formatCertificateDate(membershipData?.startDate || business.createdAt, "02/10/2026");
  const validUptoFormatted = formatCertificateDate(membershipData?.endDate || membershipData?.renewalDate, "26/09/2051");

  // Format address cleanly without duplication, dummy zeroes, or collapsed spaces
  const formattedAddress = formatCertificateAddress(business);

  const repName =
    business.contactPerson ||
    business.owner?.name ||
    business.ownerName ||
    business.representative ||
    business.user?.name ||
    "Raj Sharma";

  // Check Central Admin Customizations
  const effectiveSettings = {
    ...DEFAULT_CERTIFICATE_SETTINGS,
    ...(customSettings || {}),
  };

  const hasCustomSig1 = Boolean(
    effectiveSettings.signatory1?.signatureUrl ||
    (effectiveSettings.signatory1?.name && effectiveSettings.signatory1.name.trim() !== DEFAULT_CERTIFICATE_SETTINGS.signatory1.name) ||
    (effectiveSettings.signatory1?.title && effectiveSettings.signatory1.title.trim() !== DEFAULT_CERTIFICATE_SETTINGS.signatory1.title)
  );

  const hasCustomSig2 = Boolean(
    effectiveSettings.signatory2?.signatureUrl ||
    (effectiveSettings.signatory2?.name && effectiveSettings.signatory2.name.trim() !== DEFAULT_CERTIFICATE_SETTINGS.signatory2.name) ||
    (effectiveSettings.signatory2?.title && effectiveSettings.signatory2.title.trim() !== DEFAULT_CERTIFICATE_SETTINGS.signatory2.title)
  );

  const hasCustomAdmission = Boolean(
    effectiveSettings.admissionText &&
    effectiveSettings.admissionText.trim() !== DEFAULT_CERTIFICATE_SETTINGS.admissionText.trim()
  );

  const hasCustomOffice = Boolean(
    effectiveSettings.registeredOffice &&
    effectiveSettings.registeredOffice.trim() !== DEFAULT_CERTIFICATE_SETTINGS.registeredOffice.trim()
  );

  const hasCustomContact = Boolean(
    (effectiveSettings.contactPhone && effectiveSettings.contactPhone !== DEFAULT_CERTIFICATE_SETTINGS.contactPhone) ||
    (effectiveSettings.contactEmail && effectiveSettings.contactEmail !== DEFAULT_CERTIFICATE_SETTINGS.contactEmail) ||
    (effectiveSettings.website && effectiveSettings.website !== DEFAULT_CERTIFICATE_SETTINGS.website)
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>RIFAH Membership Certificate - ${businessName}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @page {
          size: A4 landscape;
          margin: 0;
        }
        html, body {
          background-color: ${isPreview ? "#f8fafc" : isExport ? "#ffffff" : "#0f172a"};
          background-image: ${isPreview || isExport ? "none" : "radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)"};
          font-family: 'Playfair Display', Georgia, serif;
          ${isPreview ? `
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;
            display: block;
          ` : `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: ${isExport ? "0" : "30px 15px 50px"};
            margin: 0;
            min-height: ${isExport ? `${certH}px` : "100vh"};
            width: ${isExport ? `${certW}px` : "100vw"};
            overflow: ${isExport ? "hidden" : "auto"};
          `}
          color: #111827;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          html, body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            min-height: 0 !important;
            overflow: visible !important;
          }
          .toolbar {
            display: none !important;
          }
          .cert-outer-wrapper {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            transform: scale(0.98) !important;
            transform-origin: center center !important;
            box-shadow: none !important;
            margin: auto !important;
            page-break-inside: avoid !important;
          }
        }

        .toolbar {
          width: ${certW}px;
          display: ${isPreview || isExport ? "none" : "flex"};
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 12px 20px;
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .toolbar-info {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #e2e8f0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
        }
        .toolbar-pill {
          background: rgba(220, 38, 38, 0.2);
          border: 1px solid rgba(220, 38, 38, 0.5);
          color: #fca5a5;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }
        .print-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #991b1b 100%);
          color: #ffffff;
          border: 1px solid #f87171;
          padding: 10px 24px;
          font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
          transition: all 0.2s ease;
        }
        .print-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
        }

        .cert-outer-wrapper {
          ${isPreview ? `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1);
            transform-origin: center center;
            width: ${certW}px;
            height: ${certH}px;
            margin: 0;
            padding: 0;
            box-shadow: 0 12px 36px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
            border-radius: 2px;
          ` : `
            position: relative;
            box-shadow: ${isExport ? "none" : "0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)"};
            border-radius: 2px;
            flex-shrink: 0;
            transform-origin: center center;
            ${isExport ? "margin: 0; padding: 0;" : ""}
          `}
        }

        .certificate-container {
          width: ${certW}px;
          height: ${certH}px;
          position: relative;
          overflow: hidden;
          background: #ffffff;
        }

        .template-base-img {
          position: absolute;
          top: 0;
          left: 0;
          width: ${certW}px;
          height: ${certH}px;
          object-fit: fill;
          z-index: 1;
          pointer-events: none;
        }

        /* ----------------------------------------------------
           1. METALLIC BOX: UNIFIED CRISP VECTOR TEXT
           Covers template's old meta box completely with exact gradient + crisp typography
           ---------------------------------------------------- */
        .unified-meta-box {
          position: absolute;
          left: ${tierDesign.metaBoxLeft};
          top: ${tierDesign.metaBoxTop};
          width: ${tierDesign.metaBoxWidth};
          height: ${tierDesign.metaBoxHeight};
          background: ${metaBoxBg};
          border: ${metaBoxBorder};
          border-radius: 4px;
          box-shadow: ${tierDesign.metaBoxShadow || "none"};
          z-index: 6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
          font-size: 13.5px;
          white-space: nowrap;
        }
        .meta-col {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
        }
        .meta-lbl {
          color: #991b1b;
          font-weight: 700;
          letter-spacing: 0.2px;
        }
        .meta-val {
          color: #0f172a;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        /* ----------------------------------------------------
           2. BODY CONTENT: 100% UNIFIED VECTOR TYPOGRAPHY
           Blended seamlessly with parchment background (zero white box)
           ---------------------------------------------------- */
        .unified-body-area {
          position: absolute;
          left: 298px;
          top: 282px;
          width: 655px;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          z-index: 6;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0;
          text-align: left;
        }

        .certify-line {
          font-size: 18.5px;
          color: #111827;
          line-height: 1.3;
          white-space: nowrap;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .biz-name-val {
          color: ${accentColor};
          font-size: 23px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .address-line {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 14px;
          color: #111827;
          line-height: 1.45;
          font-variant-numeric: lining-nums proportional-nums;
          -webkit-font-feature-settings: "lnum" 1;
          font-feature-settings: "lnum" 1;
          word-spacing: normal;
          letter-spacing: 0.05px;
          white-space: normal;
        }
        .address-lbl {
          font-weight: 700;
          color: #111827;
          display: inline;
          margin-right: 6px;
        }
        .address-val {
          font-weight: 700;
          color: #1f2937;
          display: inline;
          font-variant-numeric: lining-nums proportional-nums;
          -webkit-font-feature-settings: "lnum" 1;
          font-feature-settings: "lnum" 1;
        }

        .admission-para {
          font-size: 13.5px;
          color: #1f2937;
          line-height: 1.55;
          word-spacing: normal;
          letter-spacing: 0.05px;
          white-space: normal;
        }
        .admission-para strong {
          font-weight: 700;
          color: #111827;
          white-space: normal;
        }
        .address-val, .meta-val, .validity-row strong {
          font-variant-numeric: lining-nums tabular-nums;
        }

        .rep-name-line {
          color: ${accentColor};
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 0.4px;
          margin-top: 4px;
          white-space: nowrap;
        }

        /* ----------------------------------------------------
           3. VALIDITY BLOCK: UNIFIED CRISP VECTOR TEXT
           Blended seamlessly with parchment background (zero white box)
           ---------------------------------------------------- */
        .unified-validity-area {
          position: absolute;
          left: ${tierDesign.validityLeft || "40px"};
          top: ${tierDesign.validityTop || "565px"};
          width: 215px;
          height: 52px;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          z-index: 6;
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 0;
          text-align: left;
        }
        .validity-heading {
          font-size: 14px;
          color: #374151;
          font-style: normal;
        }
        .validity-row {
          font-size: 14.5px;
          color: #111827;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .validity-row strong {
          font-weight: 800;
          color: #0f172a;
        }

        /* ----------------------------------------------------
           OPTIONAL CUSTOM OVERLAYS (Admin Controlled)
           Only applied when Central Admin overrides defaults
           ---------------------------------------------------- */
        .custom-sig-slot {
          position: absolute;
          width: 215px;
          height: 130px;
          background: ${sigSlotBg};
          z-index: 6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 2px;
        }
        .custom-sig-slot-1 {
          left: 254px;
          top: 518px;
        }
        .custom-sig-slot-2 {
          left: 508px;
          top: 518px;
        }
        .custom-sig-img {
          height: 48px;
          max-width: 175px;
          object-fit: contain;
          margin-bottom: 3px;
        }
        .custom-sig-line {
          width: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .custom-sig-line::before, .custom-sig-line::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #64748b;
        }
        .custom-sig-line span {
          padding: 0 5px;
          color: #64748b;
          font-size: 10px;
          line-height: 1;
        }
        .custom-sig-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 14px;
          font-weight: 800;
          color: #991b1b;
          letter-spacing: 0.5px;
          text-align: center;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .custom-sig-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px;
          color: #111827;
          font-weight: 500;
          text-align: center;
          margin-top: 2px;
          line-height: 1.2;
        }

        .custom-patch-office {
          position: absolute;
          left: 32px;
          top: 660px;
          width: 660px;
          background: ${officeBg};
          border-radius: 2px;
          z-index: 6;
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
          font-size: 11.5px;
          color: #374151;
          line-height: 1.4;
        }
        .custom-patch-contact {
          position: absolute;
          right: 25px;
          bottom: 22px;
          width: 140px;
          z-index: 6;
          text-align: right;
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
          font-size: 11px;
          color: #ffffff;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <div class="toolbar-info">
          <span class="toolbar-pill">Official ${tierLabel} Credential</span>
          <span>Verified Chamber Member Record · ${memberId}</span>
        </div>
        <button class="print-btn" onclick="window.print()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print / Save Official Certificate
        </button>
      </div>

      <div class="cert-outer-wrapper">
        <div class="certificate-container">
          <!-- Official Base Template Image: 100% Exact High-Res Borders, Rosette, Logo, Signatures & Registered Office -->
          <img src="${templateUrl}" class="template-base-img" alt="RIFAH Certificate Template" crossOrigin="anonymous" />

          <!-- 1. Metallic Box: Razor-sharp vector labels + values -->
          <div class="unified-meta-box">
            <div class="meta-col">
              <span class="meta-lbl">Membership ID:</span>
              <span class="meta-val">${memberId}</span>
            </div>
            <div class="meta-col">
              <span class="meta-lbl">Date of Issue:</span>
              <span class="meta-val">${issueDateFormatted}</span>
            </div>
          </div>

          <!-- 2. Body Text: Razor-sharp vector typography on shared baseline -->
          <div class="unified-body-area">
            <div class="certify-line">
              <span>Certified that M/s</span>
              <span class="biz-name-val">${businessName}</span>
            </div>

            <div class="address-line">
              <span class="address-lbl">Address:</span>&nbsp;<span class="address-val">${formattedAddress}</span>
            </div>

            <div class="admission-para">
              ${hasCustomAdmission ? effectiveSettings.admissionText : `Has&nbsp;been&nbsp;duly&nbsp;admitted&nbsp;as&nbsp;a&nbsp;<strong>Member&nbsp;of&nbsp;the&nbsp;Rifah&nbsp;Chamber&nbsp;of&nbsp;Commerce&nbsp;and</strong><br /><strong>Industry</strong>.&nbsp;The&nbsp;authorized&nbsp;representative&nbsp;of&nbsp;the&nbsp;organization,&nbsp;as&nbsp;stated&nbsp;in&nbsp;the&nbsp;membership&nbsp;application,&nbsp;is:`}
            </div>

            <div class="rep-name-line">
              ${repName}
            </div>
          </div>

          <!-- 3. Validity Block: Razor-sharp vector typography on shared baseline -->
          <div class="unified-validity-area">
            <div class="validity-heading">This Certificate is</div>
            <div class="validity-row">
              <span>Valid upto:</span>
              <strong>${validUptoFormatted}</strong>
            </div>
          </div>

          <!-- Custom Signatory 1 (Chairman): only overlay if custom drawn/uploaded signature or custom name is provided -->
          ${hasCustomSig1 ? `
            <div class="custom-sig-slot custom-sig-slot-1">
              ${effectiveSettings.signatory1?.signatureUrl ? `
                <img src="${effectiveSettings.signatory1.signatureUrl}" class="custom-sig-img" alt="Chairman Signature" />
              ` : `<div style="height: 48px;"></div>`}
              <div class="custom-sig-line"><span>❖</span></div>
              <div class="custom-sig-name">${effectiveSettings.signatory1?.name || "S AMEENUL HASAN"}</div>
              <div class="custom-sig-title">${effectiveSettings.signatory1?.title || "(Chairman)"}</div>
            </div>
          ` : ""}

          <!-- Custom Signatory 2 (General Secretary): only overlay if custom drawn/uploaded signature or custom name is provided -->
          ${hasCustomSig2 ? `
            <div class="custom-sig-slot custom-sig-slot-2">
              ${effectiveSettings.signatory2?.signatureUrl ? `
                <img src="${effectiveSettings.signatory2.signatureUrl}" class="custom-sig-img" alt="General Secretary Signature" />
              ` : `<div style="height: 48px;"></div>`}
              <div class="custom-sig-line"><span>❖</span></div>
              <div class="custom-sig-name">${effectiveSettings.signatory2?.name || "MIRZA AFZAL BAIG"}</div>
              <div class="custom-sig-title">${effectiveSettings.signatory2?.title || "(General Secretary)"}</div>
            </div>
          ` : ""}

          <!-- Custom Registered Office: only overlay if Central Admin modified it -->
          ${hasCustomOffice ? `
            <div class="custom-patch-office">
              <strong style="color: #991b1b;">Registered office:</strong> ${effectiveSettings.registeredOffice}
            </div>
          ` : ""}

          <!-- Custom Contact Details: only overlay if Central Admin modified it -->
          ${hasCustomContact ? `
            <div class="custom-patch-contact">
              <div>${effectiveSettings.contactPhone || "+91-8097781851"} 📞</div>
              <div>${effectiveSettings.contactEmail || "office@rifah.org"} ✉️</div>
              <div>${effectiveSettings.website || "www.rifah.org"} 🌐</div>
            </div>
          ` : ""}
        </div>
      </div>

      ${isPreview ? `
        <script>
          function fitCert() {
            var wrapper = document.querySelector('.cert-outer-wrapper');
            if (!wrapper) return;
            var w = window.innerWidth || document.documentElement.clientWidth || (document.body && document.body.clientWidth) || ${certW};
            var h = window.innerHeight || document.documentElement.clientHeight || (document.body && document.body.clientHeight) || ${certH};
            if (!w || !h || w < 50 || h < 50) return;
            var pad = 24;
            var availW = Math.max(10, w - pad);
            var availH = Math.max(10, h - pad);
            var scale = Math.min(availW / ${certW}, availH / ${certH});
            wrapper.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
          }
          window.addEventListener('resize', fitCert);
          window.addEventListener('load', fitCert);
          document.addEventListener('DOMContentLoaded', fitCert);
          if (typeof ResizeObserver !== 'undefined') {
            try {
              new ResizeObserver(function() {
                fitCert();
              }).observe(document.documentElement);
            } catch (e) {}
          }
          setTimeout(fitCert, 10);
          setTimeout(fitCert, 50);
          setTimeout(fitCert, 150);
          setTimeout(fitCert, 300);
          setTimeout(fitCert, 500);
          setTimeout(fitCert, 800);
        </script>
      ` : ""}
      ${autoprint ? `
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      ` : ""}
    </body>
    </html>
  `;
}

export async function downloadCertificatePdf(business, membershipData = null, options = {}) {
  if (typeof window === "undefined" || !business) return;

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  // Retrieve Central Admin settings if not passed explicitly
  let customSettings = options.customSettings || options.certificateSettings || null;
  if (!customSettings) {
    try {
      const { settingsApi } = await import("@shared/lib/api-services");
      const res = await settingsApi.get();
      customSettings = res?.certificateSettings || res?.data?.certificateSettings || null;
    } catch (e) {
      // Fallback to defaults
    }
  }

  const rawTier =
    options.tier ||
    membershipData?.planName ||
    membershipData?.tier ||
    membershipData?.planId ||
    business?.membershipTier ||
    business?.membership ||
    business?.membershipPlan ||
    business?.tier ||
    "diamond";

  const tierDesign = getTierDesign(rawTier, "", customSettings) || {};
  const certW = tierDesign.width || 1000;
  const certH = tierDesign.height || 705;
  const safeTierLabel = tierDesign.tierLabel || "Member";

  const businessName = business.name || "Business Enterprise";
  const cleanName = businessName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
  const fileName = `${cleanName}_RIFAH_${safeTierLabel}_Certificate.pdf`;

  // Position in viewport flow behind other content so layout and image dimensions are properly computed
  const iframe = document.createElement("iframe");
  iframe.id = "rifah-cert-export-frame";
  iframe.style.position = "fixed";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = `${certW}px`;
  iframe.style.height = `${certH}px`;
  iframe.style.border = "none";
  iframe.style.zIndex = "-9999";
  iframe.style.opacity = "0.01";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  // Defensive interceptor on createPattern to prevent browser InvalidStateError if any 0-dimension canvas is passed
  const origCreatePattern = window.CanvasRenderingContext2D.prototype.createPattern;
  const safeCreatePattern = function (image, repetition) {
    if (image && (image.width === 0 || image.height === 0)) {
      const fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.width = 1;
      fallbackCanvas.height = 1;
      return origCreatePattern.call(this, fallbackCanvas, repetition || "repeat");
    }
    return origCreatePattern.call(this, image, repetition);
  };
  window.CanvasRenderingContext2D.prototype.createPattern = safeCreatePattern;

  try {
    const rawHtml = generateCertificateHtml(business, membershipData, {
      isPreview: false,
      isExport: true,
      customSettings,
      tier: rawTier,
    });

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(rawHtml);
    doc.close();

    if (iframe.contentWindow && iframe.contentWindow.CanvasRenderingContext2D) {
      iframe.contentWindow.CanvasRenderingContext2D.prototype.createPattern = safeCreatePattern;
    }

    if (doc.fonts && doc.fonts.ready) {
      await doc.fonts.ready;
    }

    // Wait for all images inside the iframe to finish loading (fast check)
    const images = Array.from(doc.images || []);
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 500);
        });
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 60));

    const certContainer = doc.querySelector(".certificate-container") || doc.querySelector(".cert-outer-wrapper") || doc.body;

    const canvas = await html2canvas(certContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: certW,
      height: certH,
      windowWidth: certW,
      windowHeight: certH,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.96);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // A4 Landscape: 297mm x 210mm
    const pageW = 297;
    const pageH = 210;
    const pageRatio = pageW / pageH;
    const certRatio = certW / certH;

    let renderW = pageW;
    let renderH = pageH;
    let renderX = 0;
    let renderY = 0;

    // Preserve exact aspect ratio
    if (Math.abs(certRatio - pageRatio) > 0.02) {
      if (certRatio > pageRatio) {
        renderH = pageW / certRatio;
        renderY = (pageH - renderH) / 2;
      } else {
        renderW = pageH * certRatio;
        renderX = (pageW - renderW) / 2;
      }
    }

    pdf.addImage(imgData, "JPEG", renderX, renderY, renderW, renderH, undefined, "FAST");
    pdf.save(fileName);
  } catch (err) {
    console.error("Direct certificate PDF download failed:", err);
    throw err;
  } finally {
    window.CanvasRenderingContext2D.prototype.createPattern = origCreatePattern;
    try {
      iframe.remove();
    } catch (e) {}
  }
}
