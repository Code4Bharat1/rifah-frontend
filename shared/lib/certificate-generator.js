// Official RIFAH Chamber of Commerce Membership Certificate Generator
// Replicates the exact designs for all 4 Membership Tiers: Silver, Platinum, Diamond, Gold

export function printDocumentInPage(html) {
  if (typeof window === "undefined") return;

  // Clean up any existing print iframe to prevent duplicate elements
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

function formatCertificateDate(dateInput, defaultFormatted) {
  if (!dateInput) return defaultFormatted;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return defaultFormatted;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getTierDesign(rawTier = "silver", origin = "") {
  const norm = String(rawTier || "").toLowerCase().trim();

  // 1. DIAMOND TIER: Royal Navy Blue polygon header, Diamond Rosette, Royal Blue Highlights
  if (norm.includes("diamond")) {
    return {
      tierKey: "diamond",
      tierLabel: "Diamond",
      templateUrl: `${origin}/certificate-diamond.jpg`,
      width: 1024,
      height: 724,
      accentColor: "#004b87",
      metaBox: {
        top: 185,
        left: 442,
        width: 518,
        height: 29,
        border: "1.1px solid #004b87",
      },
      bodyContent: {
        top: 292,
        left: 305,
        width: 645,
        minHeight: 195,
      },
      validity: {
        top: 580,
        left: 55,
        width: 200,
        height: 40,
      },
    };
  }

  // 2. PLATINUM TIER: Steel/Blue-Grey polygon header, Platinum Crown Badge, Deep Navy Highlights
  if (norm.includes("platinum")) {
    return {
      tierKey: "platinum",
      tierLabel: "Platinum",
      templateUrl: `${origin}/certificate-platinum.jpg`,
      width: 1024,
      height: 768,
      accentColor: "#102a45",
      metaBox: {
        top: 196,
        left: 454,
        width: 535,
        height: 30,
        border: "1.1px solid #4a6fa5",
      },
      bodyContent: {
        top: 310,
        left: 328,
        width: 650,
        minHeight: 200,
      },
      validity: {
        top: 616,
        left: 65,
        width: 210,
        height: 42,
      },
    };
  }

  // 3. GOLD TIER: Crimson/Maroon polygon header with Gold Filigree, Gold Crown Rosette, Deep Crimson Highlights
  if (norm.includes("gold")) {
    return {
      tierKey: "gold",
      tierLabel: "Gold",
      templateUrl: `${origin}/certificate-gold.jpg`,
      width: 1024,
      height: 768,
      accentColor: "#8b1d1d",
      metaBox: {
        top: 196,
        left: 455,
        width: 535,
        height: 30,
        border: "1.1px solid #b45309",
      },
      bodyContent: {
        top: 310,
        left: 322,
        width: 650,
        minHeight: 200,
      },
      validity: {
        top: 618,
        left: 65,
        width: 210,
        height: 42,
      },
    };
  }

  // 4. SILVER TIER (Default): Dark Charcoal/Silver header, Silver 5-Star Rosette, Crimson Red Highlights
  return {
    tierKey: "silver",
    tierLabel: "Silver",
    templateUrl: `${origin}/certificate-silver.jpg`,
    width: 1024,
    height: 716,
    accentColor: "#c01e1e",
    metaBox: {
      top: 184,
      left: 480,
      width: 486,
      height: 29,
      border: "1.1px solid #8b1d1d",
    },
    bodyContent: {
      top: 292,
      left: 324,
      width: 620,
      minHeight: 195,
    },
    validity: {
      top: 575,
      left: 65,
      width: 200,
      height: 40,
    },
  };
}

export function generateCertificateHtml(business, membershipData = null, options = {}) {
  if (!business) return "";

  const { isPreview = false, autoprint = false, isExport = false } = options;
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
    "silver";

  const tierDesign = getTierDesign(rawTier, origin);
  const { width: certW, height: certH, templateUrl, accentColor, metaBox, bodyContent, validity, tierLabel } = tierDesign;

  const businessName = business.name || "Business Enterprise";
  const memberId =
    business.membershipId && !business.membershipId.startsWith("RIFAH-MEM-")
      ? business.membershipId
      : `RIFAH-${(business.chapter || "PUN").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3) || "PUN"}-0001`;

  const issueDateFormatted = formatCertificateDate(membershipData?.startDate || business.createdAt, "03/07/2025");
  const validUptoFormatted = formatCertificateDate(membershipData?.endDate || membershipData?.renewalDate, "16/09/2026");

  // Format address with clean spacing and proper commas
  let formattedAddress = "";
  const rawCandidate = business.fullAddress || business.address || "";
  if (rawCandidate && (rawCandidate.includes(",") || rawCandidate.includes(" "))) {
    formattedAddress = rawCandidate.trim();
  } else {
    const rawParts = [
      business.address,
      business.street,
      business.area,
      business.city,
      business.pincode ? String(business.pincode) : "",
      business.state,
    ].filter(Boolean);

    let cleanParts = [];
    for (const part of rawParts) {
      const trimmed = String(part).trim();
      if (trimmed && !cleanParts.some((cp) => cp.toLowerCase() === trimmed.toLowerCase())) {
        cleanParts.push(trimmed);
      }
    }

    if (cleanParts.length === 1 && cleanParts[0].length > 15) {
      const unMerged = cleanParts[0]
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
        .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      const deduplicated = [];
      for (const token of unMerged) {
        if (!deduplicated.some((dt) => dt.toLowerCase() === token.toLowerCase())) {
          deduplicated.push(token);
        }
      }
      cleanParts = deduplicated;
    }

    if (cleanParts.length >= 2) {
      formattedAddress = cleanParts.join(", ");
    } else if (cleanParts.length === 1) {
      formattedAddress = cleanParts[0];
    } else {
      formattedAddress = "30 Number Ground Floor, Milleninium Textile Market-2 (M/2), Ring Road, Surat, 395003 Gujarat";
    }
  }

  const repName =
    business.contactPerson ||
    business.owner?.name ||
    business.ownerName ||
    business.representative ||
    business.user?.name ||
    "Authorized Representative";

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

        /* Dynamic Overlay: Membership ID & Date of Issue Box */
        .overlay-meta-box {
          position: absolute;
          top: ${metaBox.top}px;
          left: ${metaBox.left}px;
          width: ${metaBox.width}px;
          height: ${metaBox.height}px;
          line-height: ${metaBox.height - 2}px;
          background-color: #ffffff;
          border: ${metaBox.border};
          border-radius: 2px;
          z-index: 5;
          box-sizing: border-box;
          padding: 0 12px;
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
          font-size: 13.5px;
          white-space: nowrap;
          overflow: hidden;
        }
        .meta-box-item-left {
          float: left;
          height: ${metaBox.height - 2}px;
          line-height: ${metaBox.height - 2}px;
          position: relative;
          top: -1px;
        }
        .meta-box-item-right {
          float: right;
          height: ${metaBox.height - 2}px;
          line-height: ${metaBox.height - 2}px;
          position: relative;
          top: -1px;
        }
        .meta-label-red {
          color: #991b1b;
          font-weight: 700;
          line-height: ${metaBox.height - 2}px;
        }
        .meta-val-black {
          color: #111827;
          font-weight: 700;
          margin-left: 5px;
          line-height: ${metaBox.height - 2}px;
        }

        /* Dynamic Overlay: Certificate Body Content */
        .overlay-body-content {
          position: absolute;
          top: ${bodyContent.top}px;
          left: ${bodyContent.left}px;
          width: ${bodyContent.width}px;
          min-height: ${bodyContent.minHeight}px;
          background: #ffffff;
          z-index: 5;
          text-align: left;
          font-family: 'Playfair Display', Georgia, serif;
        }
        .line-certify {
          font-size: 18px;
          color: #111827;
          line-height: 1.35;
          white-space: nowrap;
        }
        .biz-name-highlight {
          color: ${accentColor};
          font-size: 23px;
          font-weight: 800;
          letter-spacing: 0.3px;
          margin-left: 6px;
        }
        .line-address {
          font-size: 14.5px;
          color: #111827;
          line-height: 1.45;
          margin-top: 10px;
          max-width: 610px;
        }
        .line-address strong {
          font-weight: 700;
          color: #111827;
        }
        .line-admission {
          font-size: 14px;
          color: #111827;
          line-height: 1.55;
          margin-top: 10px;
          max-width: 610px;
          word-spacing: 1.5px;
        }
        .line-admission strong {
          font-weight: 700;
          color: #111827;
          word-spacing: 1.5px;
        }
        .rep-name-highlight {
          color: ${accentColor};
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 0.4px;
          margin-top: 8px;
          white-space: nowrap;
        }

        /* Dynamic Overlay: Validity Date */
        .overlay-validity {
          position: absolute;
          top: ${validity.top}px;
          left: ${validity.left}px;
          width: ${validity.width}px;
          height: ${validity.height}px;
          background: #ffffff;
          z-index: 5;
          text-align: left;
          font-family: 'Playfair Display', Georgia, serif;
        }
        .validity-txt-label {
          font-size: 14px;
          color: #374151;
        }
        .validity-txt-val {
          font-size: 15px;
          color: #111827;
          margin-top: 2px;
        }
        .validity-txt-val strong {
          font-weight: 700;
          color: #111827;
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
          <!-- Official Base Template Image: 100% Exact Borders, Badge, Logo, Corners, Signatures & Registered Office -->
          <img src="${templateUrl}" class="template-base-img" alt="RIFAH Certificate Template" crossOrigin="anonymous" />

          <!-- Dynamic Box: Membership ID & Date of Issue -->
          <div class="overlay-meta-box">
            <div class="meta-box-item-left">
              <span class="meta-label-red">Membership ID:</span><span class="meta-val-black">${memberId}</span>
            </div>
            <div class="meta-box-item-right">
              <span class="meta-label-red">Date of Issue:</span><span class="meta-val-black">${issueDateFormatted}</span>
            </div>
          </div>

          <!-- Dynamic Body Content -->
          <div class="overlay-body-content">
            <div class="line-certify">
              Certified that M/s<span class="biz-name-highlight">${businessName}</span>
            </div>

            <div class="line-address">
              Address:&nbsp;<strong>${formattedAddress}</strong>
            </div>

            <div class="line-admission">
              Has&nbsp;been&nbsp;duly&nbsp;admitted&nbsp;as&nbsp;a&nbsp;<strong>Member&nbsp;of&nbsp;the&nbsp;Rifah&nbsp;Chamber&nbsp;of&nbsp;Commerce&nbsp;and</strong><br />
              <strong>Industry</strong>.&nbsp;The&nbsp;authorized&nbsp;representative,&nbsp;as&nbsp;stated&nbsp;in&nbsp;the&nbsp;application,&nbsp;is:
            </div>

            <div class="rep-name-highlight">
              ${repName}
            </div>
          </div>

          <!-- Dynamic Validity Block -->
          <div class="overlay-validity">
            <div class="validity-txt-label">This Certificate is</div>
            <div class="validity-txt-val">Valid upto:&nbsp;<strong>${validUptoFormatted}</strong></div>
          </div>
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

export async function downloadCertificatePdf(business, membershipData = null) {
  if (typeof window === "undefined" || !business) return;

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const rawTier =
    membershipData?.planName ||
    membershipData?.tier ||
    membershipData?.planId ||
    business?.membershipTier ||
    business?.membership ||
    business?.membershipPlan ||
    business?.tier ||
    "silver";

  const tierDesign = getTierDesign(rawTier);
  const certW = tierDesign.width;
  const certH = tierDesign.height;

  const businessName = business.name || "Business Enterprise";
  const cleanName = businessName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
  const fileName = `${cleanName}_RIFAH_${tierDesign.tierLabel}_Certificate.pdf`;

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
    const rawHtml = generateCertificateHtml(business, membershipData, { isPreview: false, isExport: true });
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

    // Wait for all images inside the iframe to finish loading
    const images = Array.from(doc.images || []);
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 3000);
        });
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 350));

    const certContainer = doc.querySelector(".certificate-container") || doc.querySelector(".cert-outer-wrapper") || doc.body;

    const canvas = await html2canvas(certContainer, {
      scale: 3,
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

    const imgData = canvas.toDataURL("image/png");
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

    // Preserve exact aspect ratio if slightly different from A4 landscape
    if (Math.abs(certRatio - pageRatio) > 0.02) {
      if (certRatio > pageRatio) {
        renderH = pageW / certRatio;
        renderY = (pageH - renderH) / 2;
      } else {
        renderW = pageH * certRatio;
        renderX = (pageW - renderW) / 2;
      }
    }

    pdf.addImage(imgData, "PNG", renderX, renderY, renderW, renderH, undefined, "FAST");
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
