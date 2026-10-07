// Official RIFAH Chamber of Commerce Membership Certificate Generator

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
      doc.fonts.ready.then(() => {
        setTimeout(triggerPrint, 250);
      }).catch(() => {
        setTimeout(triggerPrint, 350);
      });
    } else {
      setTimeout(triggerPrint, 350);
    }
  } catch (err) {
    console.error("Failed to prepare print iframe:", err);
  }
}

export function generateCertificateHtml(business, membershipData = null, options = {}) {
  if (!business) return "";

  const { isPreview = false, autoprint = false, isExport = false } = options;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoUrl = `${origin}/rifah-logo.png`;

  const businessName = business.name || "Business Enterprise";
  const tierName = (membershipData?.planName || membershipData?.planId || business.membership || "Enterprise Member").toUpperCase();
  const chapterName = typeof business.chapter === "object"
    ? business.chapter?.name
    : (business.chapter || (business.city ? `${business.city} Chapter` : "Chamber Central Secretariat"));
  const memberId = business.membershipId || (business._id ? `RIFAH-MEM-${business._id.slice(-6).toUpperCase()}` : "RIFAH-MEM-0001");

  const startDate = membershipData?.startDate || membershipData?.createdAt || business.createdAt || new Date();
  const endDate = membershipData?.endDate || membershipData?.renewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const formattedStart = new Date(startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const formattedEnd = new Date(endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>RIFAH Membership Certificate - ${businessName}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600&family=Montserrat:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @page {
          size: A4 landscape;
          margin: 0;
        }
        html, body {
          background-color: ${isPreview ? "#f8fafc" : isExport ? "#ffffff" : "#0f172a"};
          background-image: ${isPreview || isExport ? "none" : "radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)"};
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
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
            min-height: ${isExport ? "650px" : "100vh"};
            width: ${isExport ? "940px" : "100vw"};
            overflow: ${isExport ? "hidden" : "auto"};
          `}
          color: #0b1f33;
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
            transform: scale(0.96) !important;
            transform-origin: center center !important;
            box-shadow: none !important;
            margin: auto !important;
            page-break-inside: avoid !important;
          }
        }

        .toolbar {
          width: 940px;
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
          font-size: 13px;
        }
        .toolbar-pill {
          background: rgba(197, 155, 39, 0.2);
          border: 1px solid rgba(197, 155, 39, 0.4);
          color: #fcd34d;
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
          background: linear-gradient(135deg, #c59b27 0%, #e0b84c 50%, #b8861b 100%);
          color: #0f172a;
          border: 1px solid #fef08a;
          padding: 10px 24px;
          font-weight: 800;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(197, 155, 39, 0.4);
          transition: all 0.2s ease;
        }
        .print-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(197, 155, 39, 0.5);
        }

        .cert-outer-wrapper {
          ${isPreview ? `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1);
            transform-origin: center center;
            width: 940px;
            height: 650px;
            margin: 0;
            padding: 0;
            box-shadow: 0 12px 36px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
            border-radius: 4px;
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
          width: 940px;
          height: 650px;
          background-color: #fdfbf7;
          background-image: ${isExport ? "none" : "radial-gradient(ellipse at 50% 45%, #ffffff 0%, #fdfbf7 65%, #f7f1e4 100%)"};
          border: 12px solid #081729;
          outline: 3px solid #c59b27;
          outline-offset: -7px;
          padding: 36px 54px 30px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: space-between;
          overflow: hidden;
        }

        .cert-inner-frame {
          position: absolute;
          top: 14px;
          left: 14px;
          right: 14px;
          bottom: 14px;
          border: 1px solid rgba(197, 155, 39, 0.55);
          outline: 1px solid rgba(8, 23, 41, 0.25);
          outline-offset: -5px;
          pointer-events: none;
        }

        .corner-filigree {
          position: absolute;
          width: 52px;
          height: 52px;
          pointer-events: none;
          z-index: 2;
        }
        .filigree-tl { top: 12px; left: 12px; }
        .filigree-tr { top: 12px; right: 12px; transform: scaleX(-1); }
        .filigree-bl { bottom: 12px; left: 12px; transform: scaleY(-1); }
        .filigree-br { bottom: 12px; right: 12px; transform: scale(-1); }

        .cert-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 320px;
          opacity: 0.038;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .cert-watermark-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: grayscale(100%);
        }

        .cert-header {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .cert-logo {
          height: 68px;
          max-width: 220px;
          object-fit: contain;
          filter: drop-shadow(0 2px 5px rgba(0,0,0,0.05));
        }
        .cert-chamber-tag {
          font-family: 'Montserrat', sans-serif;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 3.5px;
          color: #8a733e;
          text-transform: uppercase;
          margin-top: 8px;
        }
        .cert-title {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 24px;
          font-weight: 800;
          color: #081729;
          letter-spacing: 3.5px;
          margin-top: 5px;
          line-height: 1.15;
        }
        .ornament-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 360px;
          margin: 6px auto 3px;
        }
        .ornament-divider .line {
          flex: 1;
          height: 1px;
          background-color: #c59b27;
          opacity: 0.45;
        }
        .ornament-divider .diamond {
          color: #c59b27;
          font-size: 10px;
          line-height: 1;
        }
        .cert-credential-tag {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          color: #b45309;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2.2px;
        }

        .cert-body {
          position: relative;
          z-index: 3;
          margin: 6px 0 10px;
          max-width: 740px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .cert-presentation {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 14.5px;
          color: #556477;
          letter-spacing: 0.2px;
        }
        .member-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px;
          font-weight: 800;
          color: #081729;
          letter-spacing: 0.5px;
          text-transform: capitalize;
          margin: 6px 0 4px;
          line-height: 1.2;
        }
        .name-accent-rule {
          width: 280px;
          height: 2px;
          background-color: #c59b27;
          opacity: 0.65;
          margin-bottom: 8px;
          border-radius: 1px;
        }
        .tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #fef3c7;
          background-image: ${isExport ? "none" : "linear-gradient(135deg, #fffef7 0%, #fef3c7 50%, #fde68a 100%)"};
          border: 1px solid #d4af37;
          box-shadow: 0 2px 6px rgba(180, 130, 30, 0.16);
          padding: 3.5px 18px;
          border-radius: 50px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 10.5px;
          letter-spacing: 2px;
          color: #78350f;
          text-transform: uppercase;
        }
        .cert-body-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
          max-width: 660px;
          margin-top: 10px;
        }
        .cert-highlight {
          font-weight: 700;
          color: #081729;
        }

        .cert-footer {
          position: relative;
          z-index: 3;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 14px;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
        }

        .cert-credentials {
          text-align: left;
          font-family: 'Montserrat', sans-serif;
          font-size: 10.5px;
        }
        .cred-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2.5px;
        }
        .cred-label {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #64748b;
          width: 72px;
          text-transform: uppercase;
        }
        .cred-val {
          font-weight: 700;
          color: #081729;
          font-family: 'Plus Jakarta Sans', monospace;
          letter-spacing: 0.4px;
        }
        .cred-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          padding: 2.5px 8px;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #047857;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .status-pulse {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 5px rgba(16, 185, 129, 0.8);
        }

        .seal-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: -4px;
        }
        .seal-svg-container {
          filter: drop-shadow(0 5px 12px rgba(146, 64, 14, 0.35));
        }

        .sig-block {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 170px;
        }
        .sig-svg-wrap {
          height: 38px;
          display: flex;
          align-items: flex-end;
          margin-bottom: 2px;
          opacity: 0.9;
        }
        .sig-line {
          width: 160px;
          height: 1px;
          background: #081729;
          margin-bottom: 4px;
        }
        .sig-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 10.5px;
          color: #081729;
          letter-spacing: 0.6px;
        }
        .sig-role {
          font-size: 9.5px;
          color: #475569;
          font-weight: 600;
          margin-top: 1px;
        }
        .sig-dept {
          font-size: 8.5px;
          color: #94a3b8;
          letter-spacing: 0.5px;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 100vh !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .toolbar { display: none !important; }
          .cert-outer-wrapper {
            box-shadow: none !important;
            transform: none !important;
          }
          .certificate-container {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            border-width: 10px !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <div class="toolbar-info">
          <span class="toolbar-pill">Official Chamber Credential</span>
          <span>Verified Chamber Member Record · ${memberId}</span>
        </div>
        <button class="print-btn" onclick="window.print()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print / Save Official Certificate
        </button>
      </div>

      <div class="cert-outer-wrapper">
        <div class="certificate-container">
          <div class="cert-inner-frame"></div>
          
          <svg class="corner-filigree filigree-tl" viewBox="0 0 52 52" fill="none">
            <path d="M4 4 L4 38 M4 4 L38 4 M12 12 L12 28 M12 12 L28 12 M20 20 L20 24 M20 20 L24 20" stroke="#c59b27" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="4" cy="4" r="2.5" fill="#c59b27"/>
          </svg>
          <svg class="corner-filigree filigree-tr" viewBox="0 0 52 52" fill="none">
            <path d="M4 4 L4 38 M4 4 L38 4 M12 12 L12 28 M12 12 L28 12 M20 20 L20 24 M20 20 L24 20" stroke="#c59b27" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="4" cy="4" r="2.5" fill="#c59b27"/>
          </svg>
          <svg class="corner-filigree filigree-bl" viewBox="0 0 52 52" fill="none">
            <path d="M4 4 L4 38 M4 4 L38 4 M12 12 L12 28 M12 12 L28 12 M20 20 L20 24 M20 20 L24 20" stroke="#c59b27" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="4" cy="4" r="2.5" fill="#c59b27"/>
          </svg>
          <svg class="corner-filigree filigree-br" viewBox="0 0 52 52" fill="none">
            <path d="M4 4 L4 38 M4 4 L38 4 M12 12 L12 28 M12 12 L28 12 M20 20 L24 20" stroke="#c59b27" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="4" cy="4" r="2.5" fill="#c59b27"/>
          </svg>

          <div class="cert-watermark">
            <img src="${logoUrl}" class="cert-watermark-img" alt="" crossOrigin="anonymous" />
          </div>

          <div class="cert-header">
            <img src="${logoUrl}" alt="RIFAH Logo" class="cert-logo" crossOrigin="anonymous" />
            <div class="cert-chamber-tag">Chamber of Commerce & Business Network</div>
            <h1 class="cert-title">CERTIFICATE OF MEMBERSHIP</h1>
            <div class="ornament-divider">
              <span class="line"></span>
              <span class="diamond">◆</span>
              <span class="line"></span>
            </div>
            <div class="cert-credential-tag">Official Chamber Accreditation</div>
          </div>

          <div class="cert-body">
            <div class="cert-presentation">This is to officially certify and accredit that</div>
            <div class="member-name">${businessName}</div>
            <div class="name-accent-rule"></div>
            <div class="tier-badge">
              <span>★</span>
              <span>${tierName}</span>
              <span>★</span>
            </div>
            <p class="cert-body-text">
              is an officially registered, verified, and recognized commercial member in good standing with the
              <span class="cert-highlight">RIFAH Chamber of Commerce</span>, allocated under the
              <span class="cert-highlight">${chapterName}</span>.
              The organization is entitled to all trade rights, business networking privileges, and chamber representations.
            </p>
          </div>

          <div class="cert-footer">
            <div class="cert-credentials">
              <div class="cred-row">
                <span class="cred-label">Member ID:</span>
                <span class="cred-val">${memberId}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Allocated:</span>
                <span class="cred-val">${chapterName}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Issued On:</span>
                <span class="cred-val">${formattedStart}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Valid Until:</span>
                <span class="cred-val">${formattedEnd}</span>
              </div>
              <div class="cred-status-chip">
                <span class="status-pulse"></span>
                <span>Active & Verified Member</span>
              </div>
            </div>

            <div class="seal-wrapper">
              <div class="seal-svg-container">
                <svg width="86" height="86" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="sealGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fffbeb"/>
                      <stop offset="35%" stop-color="#f59e0b"/>
                      <stop offset="70%" stop-color="#b45309"/>
                      <stop offset="100%" stop-color="#78350f"/>
                    </linearGradient>
                    <path id="sealTextPath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                  </defs>
                  <circle cx="50" cy="50" r="46" fill="url(#sealGold)" stroke="#d97706" stroke-width="1.5"/>
                  <circle cx="50" cy="50" r="41" fill="#78350f" stroke="#fcd34d" stroke-width="1"/>
                  <circle cx="50" cy="50" r="39" fill="url(#sealGold)"/>
                  <circle cx="50" cy="50" r="27" fill="#081729" stroke="#fef08a" stroke-width="1.2"/>
                  <text font-size="6" font-family="'Montserrat', sans-serif" font-weight="800" fill="#fef08a" letter-spacing="1.5">
                    <textPath href="#sealTextPath" startOffset="0%">
                      * RIFAH CHAMBER OF COMMERCE * SEAL OF ACCREDITATION *
                    </textPath>
                  </text>
                  <polygon points="50,34 54,44 65,44 56,51 59,62 50,55 41,62 44,51 35,44 46,44" fill="#fef08a"/>
                </svg>
              </div>
            </div>

            <div class="sig-block">
              <div class="sig-svg-wrap">
                <svg width="145" height="36" viewBox="0 0 160 40" fill="none">
                  <path d="M10 28 C30 10, 45 35, 60 12 C75 2, 85 30, 110 18 C125 10, 140 24, 155 16" stroke="#081729" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="sig-line"></div>
              <div class="sig-title">Secretariat General</div>
              <div class="sig-role">RIFAH Chamber of Commerce</div>
              <div class="sig-dept">Office of Accreditation & Standards</div>
            </div>
          </div>
        </div>
      </div>

      ${isPreview ? `
        <script>
          function fitCert() {
            var wrapper = document.querySelector('.cert-outer-wrapper');
            if (!wrapper) return;
            var w = window.innerWidth || document.documentElement.clientWidth || (document.body && document.body.clientWidth) || 940;
            var h = window.innerHeight || document.documentElement.clientHeight || (document.body && document.body.clientHeight) || 650;
            if (!w || !h || w < 50 || h < 50) return;
            var pad = 24;
            var availW = Math.max(10, w - pad);
            var availH = Math.max(10, h - pad);
            var scale = Math.min(availW / 940, availH / 650);
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

  const businessName = business.name || "Business Enterprise";
  const cleanName = businessName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
  const fileName = `${cleanName}_RIFAH_Membership_Certificate.pdf`;

  // Position in viewport flow behind other content so layout and image dimensions are properly computed
  const iframe = document.createElement("iframe");
  iframe.id = "rifah-cert-export-frame";
  iframe.style.position = "fixed";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = "940px";
  iframe.style.height = "650px";
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
          setTimeout(resolve, 2500);
        });
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    const certContainer = doc.querySelector(".certificate-container") || doc.querySelector(".cert-outer-wrapper") || doc.body;

    const canvas = await html2canvas(certContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#fdfbf7",
      width: 940,
      height: 650,
      windowWidth: 940,
      windowHeight: 650,
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
    pdf.addImage(imgData, "PNG", 0, 0, 297, 210, undefined, "FAST");
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
