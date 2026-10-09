// Official RIFAH Tax Invoice Generator for Members and Admin Consoles
// Exact 1:1 Pixel-Perfect Replica matching Reference Specifications

export const INVOICE_PALETTE = {
  navy: "#0B1F4B",
  red: "#D7263D",
  gold: "#C9A227",
  lightBlue: "#EAF2FB",
  successGreen: "#1E9E5A",
  successLightBg: "#EAF7EF",
  successBorder: "#BFE5CD",
  textDark: "#111827",
  textMuted: "#6B7280",
  borders: "#E5E7EB",
  white: "#FFFFFF",
};

export function generateInvoiceHtml(payment, business = null, options = {}) {
  if (!payment) return "";

  const { isPreview = false, autoprint = false, isExport = false } = options;
  const isUsd =
    (payment.currency || "").toUpperCase() === "USD" ||
    (payment.description && payment.description.includes("(USD)"));
  const currSymbol = isUsd ? "$" : "₹";
  const currSuffix = isUsd ? " USD" : "";
  const locale = isUsd ? "en-US" : "en-IN";
  const isDelegation = Boolean(
    payment.isDelegationPayment ||
    Number(payment.tcsAmount) > 0 ||
    Number(payment.tcsRate) > 0 ||
    (payment.itemType && String(payment.itemType).toLowerCase().includes("delegation"))
  );

  const totalAmount = Number(payment.amount) || 0;
  const subtotal =
    Number(payment.subtotal) ||
    (payment.gstAmount
      ? totalAmount - Number(payment.gstAmount) - (Number(payment.tcsAmount) || 0)
      : Math.round(totalAmount / 1.18));
  const gstRate = payment.gstRate !== undefined ? payment.gstRate : isUsd ? 0 : isDelegation ? 5 : 18;
  const gstAmount =
    Number(payment.gstAmount) !== undefined && payment.gstAmount !== null
      ? Number(payment.gstAmount)
      : isUsd
      ? 0
      : isDelegation
      ? Math.round(subtotal * 0.05 * 100) / 100
      : totalAmount - subtotal;
  const tcsRate = isDelegation
    ? payment.tcsRate !== undefined
      ? payment.tcsRate
      : 2
    : Number(payment.tcsRate) || 0;
  const tcsAmount = isDelegation
    ? payment.tcsAmount !== undefined && payment.tcsAmount !== null
      ? Number(payment.tcsAmount)
      : Math.round(subtotal * 0.02 * 100) / 100
    : 0;

  const formattedAmt = `${currSymbol}${totalAmount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currSuffix}`;
  const formattedSubtotal = `${currSymbol}${subtotal.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currSuffix}`;
  const formattedGst = `${currSymbol}${gstAmount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currSuffix}`;
  const formattedTcs = `${currSymbol}${tcsAmount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currSuffix}`;

  const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://rifah.nexcorealliance.com");
  const logoUrl = `${origin}/rifah-logo.png`;

  const payerName =
    payment.payerName ||
    payment.payer?.name ||
    business?.name ||
    payment.business?.name ||
    payment.payer?.businessName ||
    business?.contactPerson ||
    "Direct Client / Member";

  const payerEmail = payment.payerEmail || payment.payer?.email || business?.email || "";
  const payerPhone = payment.payerPhone || payment.payer?.phone || business?.phone || "";
  const businessName = payment.businessName || business?.name || payment.business?.name || "";
  const location = payment.location || (business?.city ? `${business.city}${business.state ? `, ${business.state}` : ""}` : (payment.chapter ? `${payment.chapter}${payment.state ? `, ${payment.state}` : ""}` : ""));

  const billingAddress =
    business?.address ||
    (business?.city && business?.state ? `${business.city}, ${business.state}, India` : "") ||
    location ||
    business?.city ||
    "";

  const membershipId =
    business?.membershipId ||
    payment.business?.membershipId ||
    payment.payer?.membershipId ||
    (payment._id ? `RIFAH-DIA-${String(payment._id).slice(-4).toUpperCase()}` : "");

  const gstin = payment.gstin || business?.gstin || "";
  const invoiceNum =
    payment.invoiceNumber ||
    `INV-${String(payment._id || "").slice(-6).toUpperCase() || "0000"}`;
  const sacCode = payment.sacCode || "9983";
  const quantity = payment.quantity || 1;
  const itemDescriptionSubtext = payment.notes || (isDelegation ? "Official Overseas Business Delegation installment payment under Section 206C (Includes 5% GST & 2% TCS)." : payment.isCustomInvoice ? "Official chamber accredited deliverables & verified transaction record." : "Full chamber access, directory listing, event credentials and business networking desk.");

  const issueDateObj = new Date(payment.paidAt || payment.createdAt || Date.now());
  const formattedDate = issueDateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const issueDate = formattedDate;
  const formattedDateTime = issueDateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const validUntilObj = new Date(issueDateObj);
  const rawDuration = Number(payment.durationYears) || 1;
  const duration = rawDuration > 5 ? 1 : rawDuration;
  validUntilObj.setFullYear(validUntilObj.getFullYear() + duration);
  validUntilObj.setDate(validUntilObj.getDate() - 1);
  const formattedValidUntil = validUntilObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Smart Detection: Event Ticket Pass vs Membership Subscription
  const isEventPass =
    /event|pass|ticket|workshop|seminar|meet/i.test(payment.itemType || "") ||
    /event|pass|ticket/i.test(payment.description || "") ||
    /event/i.test(payment.planTier || "") ||
    /codekit/i.test(payment.description || "");

  let cardTitle = "Diamond Membership";
  let validityLabel = "Validity";
  let validityValue = `${formattedDate} – ${formattedValidUntil}`;
  let billingCycleLabel = "Billing Cycle";
  let billingCycleValue = "Annual (1 Year)";

  if (isEventPass) {
    cardTitle = "Event Digital Entry Pass";
    validityLabel = "Event Access";
    validityValue = "Valid for Event Entry";
    billingCycleLabel = "Pass Type";
    billingCycleValue = "One-Time Access Pass";
  } else {
    const rawPlan =
      payment.planTier ||
      payment.payer?.subscriberTier ||
      payment.description ||
      payment.itemType ||
      "Diamond Membership";
    cardTitle = rawPlan.toLowerCase().includes("membership") ? rawPlan : `${rawPlan} Membership`;
  }

  const transactionId = payment.transactionId || `pay_${String(payment._id || "3J9H7F49Q28").slice(-11)}`;
  
  const rawMethod = payment.method || "Razorpay (UPI)";
  const isCard = /card/i.test(rawMethod);
  const isUpi = /upi/i.test(rawMethod);
  const paymentMethodLabel = isCard ? "Razorpay (Card)" : isUpi ? "Razorpay (UPI)" : rawMethod;

  const verificationToken = payment.verificationToken || "";
  const tokenQuery = verificationToken ? `?token=${encodeURIComponent(verificationToken)}` : "";
  const verificationUrl = `${origin}/verify/invoice/${encodeURIComponent(invoiceNum)}${tokenQuery}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
    verificationUrl
  )}&margin=0`;

  const bannerSubtext = isEventPass
    ? "Your event registration payment has been received successfully."
    : "Your membership payment has been received successfully.";
  const badgeSubtitle = isEventPass ? "Tax Invoice (Event)" : "Invoice for Membership";
  const badgePillWidth = isEventPass ? 200 : 224;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>RIFAH Official Invoice - ${invoiceNum}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background-color: ${isExport ? "#ffffff" : "#f1f5f9"};
            color: #0b1f33;
            padding: ${isPreview ? "10px" : isExport ? "0" : "20px 10px"};
            display: flex;
            flex-direction: column;
            align-items: center;
            -webkit-font-smoothing: antialiased;
          }
          .print-toolbar {
            width: 100%;
            max-width: 794px;
            margin-bottom: 12px;
            display: ${isPreview || isExport ? "none" : "flex"};
            justify-content: space-between;
            align-items: center;
          }
          .print-btn {
            background: #0088d1;
            color: #ffffff;
            border: none;
            padding: 8px 20px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,136,209,0.25);
          }
          .invoice-card {
            width: 794px;
            height: 1123px;
            background: #ffffff;
            border: ${isExport ? "none" : "1px solid #e2e8f0"};
            border-radius: ${isExport ? "0" : "4px"};
            position: relative;
            box-shadow: ${isExport ? "none" : "0 10px 25px -5px rgba(0,0,0,0.08)"};
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
          }
          
          /* Main content fills available height and distributes spacing gracefully */
          .main-content {
            padding: 34px 44px 0 44px;
            position: relative;
            z-index: 2;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          /* Header */
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .logo-img {
            height: 70px;
            max-width: 330px;
            object-fit: contain;
          }
          .header-right {
            text-align: right;
            margin-top: 8px;
            position: relative;
            z-index: 5;
          }
          .invoice-big-title {
            font-size: 36px;
            font-weight: 900;
            color: ${INVOICE_PALETTE.navy};
            letter-spacing: 0.5px;
            line-height: 1;
            position: relative;
            z-index: 5;
          }
          .invoice-sub-title {
            font-size: 13.5px;
            color: ${INVOICE_PALETTE.textMuted};
            font-weight: 500;
            margin-top: 4px;
          }
          .invoice-title { font-size: 22px; font-weight: 900; color: #0b1f33; }
          .invoice-number { font-size: 14px; font-weight: 700; color: #334155; margin-top: 2px; }
          .invoice-date { font-size: 12px; color: #64748b; margin-top: 2px; }
          .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 18px; }
          .info-card-header { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0088d1; margin-bottom: 8px; letter-spacing: 1px; }
          .buyer-name { font-weight: 800; font-size: 15px; color: #0f172a; }
          .buyer-biz { font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px; }
          .buyer-detail { font-size: 12px; color: #64748b; margin-top: 2px; }
          .subtotal-line { width: 280px; display: flex; justify-content: space-between; font-size: 13px; color: #64748b; }
          .total-line { width: 280px; display: flex; justify-content: space-between; font-size: 17px; font-weight: 800; border-top: 2px solid #e2e8f0; padding-top: 8px; color: #0b1f33; }
          .auth-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 4px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; }
          .delegation-tag { display: inline-block; background: rgba(0, 136, 209, 0.12); color: #0088d1; border: 1px solid rgba(0, 136, 209, 0.3); font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .footer-section { text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 18px; line-height: 1.6; }
          
          /* Pill Badge with rock-solid canvas compatibility */
          .pill-badge {
            display: inline-block;
            border: 1px solid #94a3b8;
            border-radius: 50px;
            padding: 3px 14px;
            font-size: 10.5px;
            font-weight: 600;
            color: #334155;
            background: #ffffff;
            margin-top: 8px;
            line-height: 18px;
          }
          .red-accent-line {
            width: 42px;
            height: 3px;
            background: ${INVOICE_PALETTE.red};
            margin-left: auto;
            margin-top: 8px;
            border-radius: 2px;
          }

          /* Payment Successful Box */
          .payment-banner {
            background: ${INVOICE_PALETTE.successLightBg};
            border: 1px solid ${INVOICE_PALETTE.successBorder};
            border-radius: 12px;
            padding: 16px 22px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .banner-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .check-circle {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: ${INVOICE_PALETTE.successGreen};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .banner-title {
            font-size: 20px;
            font-weight: 800;
            color: ${INVOICE_PALETTE.successGreen};
            line-height: 1.2;
          }
          .banner-sub {
            font-size: 11.5px;
            color: #166534;
            margin-top: 2px;
            font-weight: 500;
          }
          .banner-right {
            display: flex;
            flex-direction: column;
            gap: 5px;
            font-size: 11.5px;
            text-align: right;
          }
          .banner-right-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
          }
          .banner-label {
            color: ${INVOICE_PALETTE.textMuted};
            font-weight: 500;
          }
          .banner-value {
            font-weight: 700;
            color: ${INVOICE_PALETTE.textDark};
          }

          /* 4-column Meta Strip */
          .meta-strip {
            display: grid;
            grid-template-columns: 1.15fr 1.2fr 1fr 0.95fr;
            gap: 12px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 16px;
            align-items: flex-start;
          }
          .meta-item-label {
            font-size: 11px;
            color: ${INVOICE_PALETTE.textMuted};
            font-weight: 600;
            margin-bottom: 4px;
          }
          .meta-item-value {
            font-size: 14px;
            font-weight: 800;
            color: ${INVOICE_PALETTE.textDark};
          }
          .paid-pill {
            display: inline-block;
            background: ${INVOICE_PALETTE.successLightBg};
            color: ${INVOICE_PALETTE.successGreen};
            padding: 3px 16px;
            border-radius: 50px;
            font-size: 11.5px;
            font-weight: 700;
            border: 1px solid ${INVOICE_PALETTE.successBorder};
            line-height: 18px;
            text-align: center;
          }

          /* Two Cards */
          .cards-grid {
            display: grid;
            grid-template-columns: 1.18fr 0.82fr;
            gap: 16px;
          }
          .card-box {
            border: 1px solid ${INVOICE_PALETTE.borders};
            border-radius: 12px;
            padding: 16px 20px;
            background: #ffffff;
          }
          .card-header-line {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .card-icon-square {
            width: 26px;
            height: 26px;
            border-radius: 6px;
            background: ${INVOICE_PALETTE.lightBlue};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .card-title-text {
            font-size: 13px;
            font-weight: 800;
            color: ${INVOICE_PALETTE.textDark};
          }
          .card-company-name {
            font-size: 14px;
            font-weight: 800;
            color: ${INVOICE_PALETTE.textDark};
            margin-bottom: 4px;
          }
          .card-desc-text {
            font-size: 11.5px;
            color: ${INVOICE_PALETTE.textMuted};
            line-height: 1.5;
            white-space: pre-line;
          }

          /* Table */
          .table-container {
            border: 1px solid ${INVOICE_PALETTE.borders};
            border-radius: 8px;
            overflow: hidden;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: ${INVOICE_PALETTE.lightBlue};
            border-bottom: 1px solid ${INVOICE_PALETTE.borders};
            padding: 12px 18px;
            font-size: 11.5px;
            font-weight: 800;
            color: ${INVOICE_PALETTE.navy};
          }
          td {
            padding: 16px 18px;
            font-size: 12.5px;
            color: ${INVOICE_PALETTE.textDark};
          }
          .row-subtotal td {
            padding: 10px 18px 4px 18px;
            font-size: 12.5px;
            color: ${INVOICE_PALETTE.textMuted};
            font-weight: 600;
          }
          .row-gst td {
            padding: 4px 18px 10px 18px;
            font-size: 12.5px;
            color: ${INVOICE_PALETTE.textMuted};
            font-weight: 600;
          }
          .row-total-paid {
            background: ${INVOICE_PALETTE.lightBlue};
          }
          .row-total-paid td {
            padding: 14px 20px;
            font-size: 16px;
            font-weight: 900;
            color: ${INVOICE_PALETTE.navy};
          }

          /* Notes & QR Row */
          .notes-qr-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
          }
          .notes-left {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            max-width: 480px;
          }
          .notes-icon-square {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: ${INVOICE_PALETTE.lightBlue};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .notes-heading {
            font-size: 12.5px;
            font-weight: 800;
            color: ${INVOICE_PALETTE.textDark};
            margin-bottom: 6px;
          }
          .notes-bullets {
            list-style: disc;
            padding-left: 16px;
            font-size: 11px;
            color: ${INVOICE_PALETTE.textMuted};
            line-height: 1.6;
            margin: 0;
          }

          .qr-box-bordered {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border: 1px solid ${INVOICE_PALETTE.borders};
            border-radius: 8px;
            background: #ffffff;
          }
          .qr-image {
            width: 76px;
            height: 76px;
            object-fit: contain;
          }
          .qr-info-text {
            text-align: left;
          }
          .qr-heading {
            font-size: 12px;
            font-weight: 800;
            color: ${INVOICE_PALETTE.textDark};
            line-height: 1.2;
          }
          .qr-subtext {
            font-size: 10px;
            font-weight: 500;
            color: ${INVOICE_PALETTE.textMuted};
            margin-top: 3px;
            line-height: 1.35;
          }

          /* Signatures and Laurel Row - Positioned with ample breathing room above bottom-left accent */
          .bottom-signs-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-bottom: 24px;
            position: relative;
            z-index: 5;
          }
          .signatory-block {
            text-align: left;
          }
          .sign-title {
            font-size: 12.5px;
            font-weight: 800;
            color: ${INVOICE_PALETTE.textDark};
            margin-top: 2px;
          }
          .sign-org {
            font-size: 11px;
            color: ${INVOICE_PALETTE.textMuted};
            margin-top: 1px;
          }

          .laurel-block {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Footer Bar */
          .bottom-footer-bar {
            background: ${INVOICE_PALETTE.navy};
            color: #ffffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 26px;
            font-size: 11px;
            position: relative;
            overflow: hidden;
            z-index: 10;
            height: 44px;
            box-sizing: border-box;
          }
          .footer-contacts {
            display: flex;
            gap: 26px;
            align-items: center;
            z-index: 2;
          }
          .footer-contact-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
          }
          .footer-red-banner {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            background: ${INVOICE_PALETTE.red};
            clip-path: polygon(20px 0%, 100% 0%, 100% 100%, 0% 100%);
            display: flex;
            align-items: center;
            padding: 0 24px 0 36px;
            font-weight: 800;
            font-size: 11px;
            letter-spacing: 0.5px;
            z-index: 3;
          }

          @media print {
            body { background: #fff !important; padding: 0 !important; }
            .print-toolbar { display: none !important; }
            .invoice-card { box-shadow: none !important; border: none !important; border-radius: 0 !important; width: 100% !important; height: 100% !important; }
            .main-content { padding: 30px 38px 0 38px !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar">
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">RIFAH Chamber Official GST Invoice</span>
          <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        </div>

        <div class="invoice-card">
          <!-- Top Right Corner Polygonal Graphic matching Reference Sample -->
          <div style="position: absolute; top: 0; right: 0; width: 170px; height: 75px; pointer-events: none; z-index: 1;">
            <svg width="170" height="75" viewBox="0 0 170 75" fill="none" style="display: block; width: 100%; height: 100%;">
              <polygon points="40,0 170,0 170,38" fill="${INVOICE_PALETTE.navy}" />
              <polygon points="125,25 170,38 170,68" fill="${INVOICE_PALETTE.red}" />
            </svg>
          </div>

          <!-- Bottom Left Corner Polygonal Graphic matching Reference Sample (Compact Corner Wedge) -->
          <div style="position: absolute; bottom: 44px; left: 0; width: 75px; height: 35px; pointer-events: none; z-index: 1;">
            <svg width="75" height="35" viewBox="0 0 75 35" fill="none" style="display: block;">
              <polygon points="0,0 0,35 75,35" fill="${INVOICE_PALETTE.navy}" />
              <polygon points="0,18 0,35 35,35" fill="${INVOICE_PALETTE.red}" />
            </svg>
          </div>

          <div class="main-content">
            <!-- Header Row -->
            <div class="header-row">
              <div>
                <img src="${logoUrl}" class="logo-img" alt="RIFAH Logo" onerror="this.style.display='none'" />
              </div>
              <div class="header-right">
                ${isDelegation ? '<div class="delegation-tag">Overseas Delegation</div>' : ""}
                <div class="invoice-big-title">${isDelegation ? "DELEGATION TAX INVOICE" : "INVOICE"}</div>
                <div class="invoice-sub-title">Payment Confirmation</div>
                <div style="margin-top: 8px;">
                  <svg width="${badgePillWidth}" height="24" viewBox="0 0 ${badgePillWidth} 24" style="display: inline-block;">
                    <rect x="0.5" y="0.5" width="${badgePillWidth - 1}" height="23" rx="11.5" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
                    <text x="50" y="16" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10" font-weight="600" fill="#334155">Original Copy</text>
                    <line x1="100" y1="5" x2="100" y2="19" stroke="#cbd5e1" stroke-width="1" />
                    <text x="${100 + (badgePillWidth - 100) / 2}" y="16" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10" font-weight="600" fill="#334155">${badgeSubtitle}</text>
                  </svg>
                </div>
                <div class="red-accent-line"></div>
              </div>
            </div>

            <!-- Green Payment Successful Banner -->
            <div class="payment-banner">
              <div class="banner-left">
                <div class="check-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <div class="banner-title">${(payment.status || "").toLowerCase() === "paid" || (payment.status || "").toLowerCase() === "completed" ? "Payment Successful" : "Payment Pending"}</div>
                  <div class="banner-sub">${bannerSubtext}</div>
                </div>
              </div>
              <div class="banner-right">
                <div class="banner-right-row">
                  <span class="banner-label">Transaction ID</span>
                  <span class="banner-value">${transactionId}</span>
                </div>
                <div class="banner-right-row">
                  <span class="banner-label">Payment Date</span>
                  <span class="banner-value">${formattedDateTime}</span>
                </div>
                <div class="banner-right-row" style="align-items: center;">
                  <span class="banner-label">Payment Method</span>
                  <span class="banner-value" style="display: inline-flex; align-items: center; gap: 6px;">
                    ${
                      isCard
                        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0088d1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`
                        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="${INVOICE_PALETTE.navy}"><path d="M22 2L10 10l-3 9 8-5 1-5 4-2-3 9-10 6-7 4 12-8 3-8-8 5-1 5-4 2 3-9 10-6z"/></svg>`
                    }
                    ${paymentMethodLabel}
                  </span>
                </div>
              </div>
            </div>
            <!-- Metadata 4-Column Strip -->
            <div class="meta-strip">
              <div>
                <div class="meta-item-label">Invoice No.</div>
                <div class="meta-item-value">${invoiceNum}</div>
              </div>
              <div>
                <div class="meta-item-label">Membership ID</div>
                <div class="meta-item-value">${membershipId}</div>
              </div>
              <div>
                <div class="meta-item-label">Invoice Date</div>
                <div class="meta-item-value">${formattedDate}</div>
              </div>
              <div>
                <div class="meta-item-label">Payment Status</div>
                <div>
                  <svg width="60" height="22" viewBox="0 0 60 22" style="display: inline-block;">
                    <rect x="0.5" y="0.5" width="59" height="21" rx="10.5" fill="${INVOICE_PALETTE.successLightBg}" stroke="${INVOICE_PALETTE.successBorder}" stroke-width="1"/>
                    <text x="30" y="15" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11" font-weight="700" fill="${INVOICE_PALETTE.successGreen}">Paid</text>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Two Cards: Billed To & Membership Details -->
            <div class="cards-grid">
              <div class="card-box">
                <div class="card-header-line">
                  <div class="card-icon-square">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0088d1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <line x1="9" y1="6" x2="9" y2="6.01"></line>
                      <line x1="15" y1="6" x2="15" y2="6.01"></line>
                      <line x1="9" y1="10" x2="9" y2="10.01"></line>
                      <line x1="15" y1="10" x2="15" y2="10.01"></line>
                      <line x1="9" y1="14" x2="9" y2="14.01"></line>
                      <line x1="15" y1="14" x2="15" y2="14.01"></line>
                      <line x1="9" y1="18" x2="15" y2="18"></line>
                    </svg>
                  </div>
                  <span class="card-title-text">Billed To</span>
                </div>
                <div class="card-company-name">${payerName}</div>
                ${businessName ? `<div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px;">${businessName}</div>` : ""}
                ${gstin ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">GSTIN: <strong>${gstin}</strong></div>` : ""}
                ${payerEmail ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">${payerEmail}</div>` : ""}
                ${payerPhone ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">${payerPhone}</div>` : ""}
                <div class="card-desc-text">${billingAddress}</div>
              </div>

              <div class="card-box">
                <div class="card-header-line">
                  <div class="card-icon-square">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0088d1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 3h12l4 6-10 12L2 9z"></path>
                      <path d="M11 3 L8 9 L12 21 L16 9 L13 3"></path>
                    </svg>
                  </div>
                  <span class="card-title-text" style="color: ${INVOICE_PALETTE.navy};">${cardTitle}</span>
                </div>
                <div class="card-desc-text" style="line-height: 1.6; margin-top: 6px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>${validityLabel}</span>
                    <span style="font-weight: 700; color: #0b1f33;">${validityValue}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                    <span>${billingCycleLabel}</span>
                    <span style="font-weight: 700; color: #0b1f33;">${billingCycleValue}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table -->
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 45px; text-align: center;">#</th>
                    <th style="text-align: left;">Description</th>
                    <th style="width: 70px; text-align: center;">Qty</th>
                    <th style="width: 150px; text-align: right;">Amount (${isUsd ? "USD" : "INR"})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="text-align: center; font-weight: 600;">1</td>
                    <td style="font-weight: 600;">
                      <strong>${payment.description || payment.purpose || payment.itemType || `${cardTitle}`}</strong>
                      ${itemDescriptionSubtext ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 2px; font-weight: normal;">${itemDescriptionSubtext}</div>` : ""}
                    </td>
                    <td style="text-align: center; font-weight: 600;">${quantity || 1}</td>
                    <td style="text-align: right; font-weight: 700;">${formattedSubtotal}</td>
                  </tr>
                  <tr class="row-subtotal">
                    <td colspan="3" style="text-align: right;">Subtotal</td>
                    <td style="text-align: right; font-weight: 700;">${formattedSubtotal}</td>
                  </tr>
                  <tr class="row-gst">
                    <td colspan="3" style="text-align: right;">GST (${gstRate}%)</td>
                    <td style="text-align: right; font-weight: 700;">${formattedGst}</td>
                  </tr>
                  ${isDelegation ? `
                  <tr class="row-tcs" style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12.5px;">
                    <td colspan="3" style="text-align: right;">TCS u/s 206C (${tcsRate}%)</td>
                    <td style="text-align: right; font-weight: 700;">${formattedTcs}</td>
                  </tr>
                  ` : ""}
                  <tr class="row-total-paid">
                    <td colspan="3" style="text-align: right;">Total Paid</td>
                    <td style="text-align: right; font-weight: 900; font-size: 16px;">${formattedAmt}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Important Notes & QR Code Section -->
            <div class="notes-qr-section">
              <div class="notes-left">
                <div class="notes-icon-square">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0088d1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <div class="notes-heading">Important Notes</div>
                  <ul class="notes-bullets">
                    <li>This is a computer generated invoice and does not require a signature.</li>
                    <li>This payment is non-refundable and subject to RIFAH terms &amp; conditions.</li>
                    <li>For any queries, contact us at info@rifah.org</li>
                  </ul>
                </div>
              </div>

              <!-- Required Exact QR Container matching reference image -->
              <div class="qr-box-bordered">
                <img src="${qrImageUrl}" class="qr-image" alt="Invoice QR" />
                <div class="qr-info-text">
                  <div class="qr-heading">Scan to Verify</div>
                  <div class="qr-subtext">Invoice &amp; Membership<br/>Details</div>
                </div>
              </div>
            </div>

            <!-- Signatures & Golden Member Laurel Seal (Safely positioned above corner wedge) -->
            <div class="bottom-signs-row">
              <div class="signatory-block">
                <div style="height: 48px; margin-bottom: 2px;">
                  <svg width="150" height="46" viewBox="0 0 150 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 18 34 C 14 24, 20 8, 27 5 C 33 2, 37 7, 34 15 C 30 26, 24 37, 20 40 C 18 41, 22 38, 28 29 C 33 21, 38 17, 42 21 C 45 24, 42 29, 38 32 C 35 34, 33 31, 37 24 C 41 17, 47 19, 52 24 C 56 28, 60 26, 65 20 C 70 14, 77 17, 81 21 C 85 25, 92 23, 100 19 M 15 35 C 42 32, 76 33, 115 30 C 120 29, 124 27, 120 25 C 112 23, 98 28, 86 34" stroke="#0F172A" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="sign-title">Authorised Signatory</div>
                <div class="sign-org">RIFAH Chamber of Commerce &amp; Industry</div>
              </div>

              <!-- Solid Golden Laurel Wreath Seal (100% Canvas Safe without Gradient Glitches) -->
              <div class="laurel-block">
                <svg width="280" height="78" viewBox="0 0 280 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Royal Gold 5-point Crown -->
                  <g transform="translate(125, 2)">
                    <path d="M15 1 L19 10 L27 5 L24 16 H6 L3 5 L11 10 Z" fill="${INVOICE_PALETTE.gold}"/>
                    <circle cx="3" cy="5" r="1.5" fill="#F59E0B"/>
                    <circle cx="15" cy="1" r="1.5" fill="#F59E0B"/>
                    <circle cx="27" cy="5" r="1.5" fill="#F59E0B"/>
                    <circle cx="9" cy="14" r="1.2" fill="#FEF3C7"/>
                    <circle cx="15" cy="14" r="1.2" fill="#FEF3C7"/>
                    <circle cx="21" cy="14" r="1.2" fill="#FEF3C7"/>
                  </g>

                  <!-- Left Laurel Branch -->
                  <g transform="translate(12, 10)">
                    <path d="M38 58 C26 52 14 38 10 20 C9 15 10 10 13 8 C14 11 15 16 15 20 C18 34 27 45 40 52 Z" fill="${INVOICE_PALETTE.gold}"/>
                    <path d="M16 12 C10 8 4 11 4 16 C7 18 12 18 15 15 Z" fill="#D97706"/>
                    <path d="M12 22 C6 18 4 23 4 28 C8 30 13 29 14 25 Z" fill="#D97706"/>
                    <path d="M12 32 C6 30 4 36 6 41 C9 42 14 39 14 35 Z" fill="#D97706"/>
                    <path d="M18 42 C13 43 12 49 15 53 C18 52 21 47 20 43 Z" fill="#D97706"/>
                    <path d="M28 48 C23 51 23 56 27 59 C29 57 31 52 30 49 Z" fill="#D97706"/>
                  </g>

                  <!-- Right Laurel Branch (Mirrored) -->
                  <g transform="translate(230, 10)">
                    <path d="M0 58 C12 52 24 38 28 20 C29 15 28 10 25 8 C24 11 23 16 23 20 C20 34 11 45 -2 52 Z" fill="${INVOICE_PALETTE.gold}"/>
                    <path d="M22 12 C28 8 34 11 34 16 C31 18 26 18 23 15 Z" fill="#D97706"/>
                    <path d="M26 22 C32 18 34 23 34 28 C30 30 25 29 24 25 Z" fill="#D97706"/>
                    <path d="M26 32 C32 30 34 36 32 41 C29 42 24 39 24 35 Z" fill="#D97706"/>
                    <path d="M20 42 C25 43 26 49 23 53 C20 52 17 47 18 43 Z" fill="#D97706"/>
                    <path d="M10 48 C15 51 15 56 11 59 C9 57 7 52 8 49 Z" fill="#D97706"/>
                  </g>

                  <!-- Text inside Laurel Wreath -->
                  <text x="140" y="44" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" fill="${INVOICE_PALETTE.navy}" letter-spacing="0.3">${isEventPass ? "Official RIFAH Event Pass" : "Official RIFAH Member"}</text>
                  <text x="140" y="58" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="600" fill="${INVOICE_PALETTE.gold}">${isEventPass ? "Authorized Entry &bull; Verified" : "Network &bull; Grow &bull; Collaborate"}</text>
                </svg>
              </div>
            </div>
          </div>

          <!-- Solid Navy Footer Bar with Red Angular Wedge -->
          <div class="bottom-footer-bar">
            <div class="footer-contacts">
              <span class="footer-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                www.rifah.org
              </span>
              <span class="footer-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                info@rifah.org
              </span>
              <span class="footer-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +91 88977 83151
              </span>
            </div>
            <div class="footer-red-banner">
              TOGETHER FOR SUSTAINABLE FUTURE
            </div>
          </div>
        </div>

        ${
          autoprint
            ? `
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
        `
            : ""
        }
      </body>
    </html>
  `;
}

export async function downloadInvoicePdf(payment, business = null) {
  if (typeof window === "undefined" || !payment) return;

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const invNo =
    payment.invoiceNumber ||
    `INV-${String(payment._id || "").slice(-6).toUpperCase() || "0000"}`;
  const fileName = `RIFAH_Invoice_${invNo}.pdf`;

  const iframe = document.createElement("iframe");
  iframe.id = "rifah-invoice-export-frame";
  iframe.style.position = "fixed";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = "794px";
  iframe.style.height = "1123px";
  iframe.style.border = "none";
  iframe.style.zIndex = "-9999";
  iframe.style.opacity = "0.01";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  try {
    const rawHtml = generateInvoiceHtml(payment, business, {
      isPreview: false,
      isExport: true,
    });
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(rawHtml);
    doc.close();

    if (doc.fonts && doc.fonts.ready) {
      await doc.fonts.ready;
    }

    const images = Array.from(doc.images || []);
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 2000);
        });
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 350));

    const invoiceCard = doc.querySelector(".invoice-card") || doc.body;

    const canvas = await html2canvas(invoiceCard, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      width: 794,
      height: 1123,
      x: 0,
      y: 0,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Exact A4 Dimensions: 210mm x 297mm
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
    pdf.save(fileName);
  } catch (err) {
    console.error("Direct invoice PDF download failed:", err);
    throw err;
  } finally {
    try {
      iframe.remove();
    } catch (e) {}
  }
}

export function openAndPrintInvoice(payment, business = null) {
  if (typeof window === "undefined" || !payment) return;
  const rawHtml = generateInvoiceHtml(payment, business, { isPreview: false, autoprint: true });
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(rawHtml);
    printWindow.document.close();
  }
}
