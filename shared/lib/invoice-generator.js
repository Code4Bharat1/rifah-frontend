// Official RIFAH Tax Invoice Generator for Members and Admin Consoles
import { printDocumentInPage } from "./certificate-generator";

export function generateInvoiceHtml(payment, business = null, options = {}) {
  if (!payment) return "";

  const { isPreview = false, autoprint = false, isExport = false } = options;
  const isUsd = (payment.currency || "").toUpperCase() === "USD" || (payment.description && payment.description.includes("(USD)"));
  const currSymbol = isUsd ? "$" : "₹";
  const currSuffix = isUsd ? " USD" : "";
  const locale = isUsd ? "en-US" : "en-IN";
  
  const totalAmount = Number(payment.amount) || 0;
  const subtotal = Number(payment.subtotal) || (payment.gstAmount ? totalAmount - Number(payment.gstAmount) : Math.round(totalAmount / 1.18));
  const gstRate = payment.gstRate || 18;
  const gstAmount = Number(payment.gstAmount) || (totalAmount - subtotal);

  const formattedAmt = `${currSymbol} ${totalAmount.toLocaleString(locale)}${currSuffix}`;
  const formattedSubtotal = `${currSymbol} ${subtotal.toLocaleString(locale)}${currSuffix}`;
  const formattedGst = `${currSymbol} ${gstAmount.toLocaleString(locale)}${currSuffix}`;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoUrl = `${origin}/rifah-logo.png`;

  const payerName = payment.payer?.name || business?.contactPerson || business?.name || "Registered Member Business";
  const payerEmail = payment.payer?.email || business?.email || "";
  const businessName = business?.name || payment.business?.name || "";
  const location = business?.city ? `${business.city}${business.state ? `, ${business.state}` : ""}` : "";
  const membershipId = business?.membershipId || payment.business?.membershipId || "";
  const invoiceNum = payment.invoiceNumber || `INV-${String(payment._id || "").slice(-6).toUpperCase() || "0000"}`;
  const issueDate = new Date(payment.paidAt || payment.createdAt || Date.now()).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>RIFAH Official Invoice - ${invoiceNum}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body { background-color: #f8fafc; color: #0b1f33; padding: ${isPreview ? "15px" : isExport ? "0" : "25px 15px"}; }
          .print-toolbar { max-width: 780px; margin: 0 auto 16px auto; display: ${isPreview || isExport ? "none" : "flex"}; justify-content: space-between; align-items: center; }
          .back-note { font-size: 12px; color: #64748b; }
          .print-btn { background: #0088d1; color: #fff; border: none; padding: 9px 22px; font-size: 13px; font-weight: 700; border-radius: 7px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,136,209,0.25); transition: background 0.15s; }
          .print-btn:hover { background: #0277bd; }
          .invoice-card { max-width: 780px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: ${isExport ? "none" : "0 10px 25px -5px rgba(0,0,0,0.06)"}; }
          .brand-stripe { height: 6px; background: ${isExport ? "#0088d1" : "linear-gradient(90deg, #c90000 0%, #0088d1 50%, #0b1f33 100%)"}; }
          .invoice-body { padding: 36px 40px; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
          .logo-img { height: 44px; object-fit: contain; }
          .chamber-sub { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500; }
          .invoice-title { font-size: 22px; font-weight: 800; color: #0b1f33; letter-spacing: 0.5px; }
          .invoice-number { font-size: 14px; font-weight: 700; color: #0088d1; margin-top: 3px; font-family: monospace; }
          .invoice-date { font-size: 12px; color: #64748b; margin-top: 3px; }
          
          .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 18px; }
          .info-card-header { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0088d1; margin-bottom: 8px; letter-spacing: 1px; }
          .buyer-name { font-weight: 800; font-size: 15px; color: #0f172a; }
          .buyer-biz { font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px; }
          .buyer-detail { font-size: 12px; color: #64748b; margin-top: 2px; }
          
          .table-container { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #0b1f33; color: #fff; }
          th { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 11px 16px; text-align: left; letter-spacing: 0.8px; }
          td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .total-box { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin-bottom: 24px; }
          .subtotal-line { width: 260px; display: flex; justify-content: space-between; font-size: 13px; color: #64748b; }
          .total-line { width: 260px; display: flex; justify-content: space-between; font-size: 17px; font-weight: 800; border-top: 2px solid #e2e8f0; padding-top: 8px; color: #0b1f33; }
          
          .auth-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 4px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; }
          .footer-section { text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 18px; line-height: 1.6; }
          
          @media print {
            body { background: #fff !important; padding: 0 !important; }
            .print-toolbar { display: none !important; }
            .invoice-card { box-shadow: none !important; border: none !important; }
            .invoice-body { padding: 20px !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar">
          <span class="back-note">RIFAH Chamber Official Receipt & GST Invoice</span>
          <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        </div>
        <div class="invoice-card">
          <div class="brand-stripe"></div>
          <div class="invoice-body">
            <div class="header-row">
              <div>
                <img src="${logoUrl}" class="logo-img" alt="RIFAH Logo" />
                <div class="chamber-sub">Chamber of Commerce & Business Network</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">GSTIN: 27AABCR9823M1Z4 · Registered in Mumbai, India</div>
              </div>
              <div style="text-align: right;">
                <div class="invoice-title">TAX INVOICE</div>
                <div class="invoice-number"># ${invoiceNum}</div>
                <div class="invoice-date">Issued: ${issueDate}</div>
                <div style="margin-top: 6px;">
                  <span class="auth-badge">✓ PAYMENT VERIFIED</span>
                </div>
              </div>
            </div>

            <div class="grid-two">
              <div class="info-card">
                <div class="info-card-header">Billed To Member</div>
                <div class="buyer-name">${payerName}</div>
                ${businessName ? `<div class="buyer-biz">${businessName}</div>` : ""}
                ${membershipId ? `<div class="buyer-detail">Member ID: <strong>${membershipId}</strong></div>` : ""}
                ${payerEmail ? `<div class="buyer-detail">${payerEmail}</div>` : ""}
                ${location ? `<div class="buyer-detail">${location}</div>` : ""}
              </div>
              <div class="info-card">
                <div class="info-card-header">Payment & Audit Reference</div>
                <div style="font-size: 13px;">Status: <strong>${payment.status || "Paid"}</strong></div>
                <div style="font-size: 13px; margin-top: 4px;">Transaction ID: <strong style="font-family: monospace;">${payment.transactionId || "N/A"}</strong></div>
                <div style="font-size: 13px; margin-top: 4px;">Payment Mode: <strong>${payment.method || "Online Razorpay"}</strong></div>
                <div style="font-size: 13px; margin-top: 4px;">Paid On: <strong>${issueDate}</strong></div>
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>SAC Code</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>${payment.description || payment.purpose || payment.itemType || "Annual Chamber Membership Accreditation"}</strong>
                      <div style="font-size: 11.5px; color: #64748b; margin-top: 3px;">Full chamber access, directory listing, event credentials and business networking desk.</div>
                    </td>
                    <td>9983</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right; font-weight: 700;">${formattedSubtotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="total-box">
              <div class="subtotal-line">
                <span>Subtotal (Base):</span>
                <span>${formattedSubtotal}</span>
              </div>
              <div class="subtotal-line">
                <span>GST (${gstRate}%):</span>
                <span>${formattedGst}</span>
              </div>
              <div class="total-line">
                <span>Total Amount Paid:</span>
                <span style="color: #0088d1;">${formattedAmt}</span>
              </div>
            </div>

            <div class="footer-section">
              <p>This is a computer-generated tax invoice issued by <strong>RIFAH Chamber of Commerce</strong>. No physical signature is required.</p>
              <p style="margin-top: 4px; font-size: 11px; color: #94a3b8;">For billing queries or tax invoice amendments, contact <strong>secretariat@rifah.org</strong>.</p>
            </div>
          </div>
        </div>
        ${autoprint ? `
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
        ` : ""}
      </body>
    </html>
  `;
}

export async function downloadInvoicePdf(payment, business = null) {
  if (typeof window === "undefined" || !payment) return;

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const invNo = payment.invoiceNumber || `INV-${String(payment._id || "").slice(-6).toUpperCase() || "0000"}`;
  const fileName = `RIFAH_Invoice_${invNo}.pdf`;

  const iframe = document.createElement("iframe");
  iframe.id = "rifah-invoice-export-frame";
  iframe.style.position = "fixed";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = "780px";
  iframe.style.height = "1200px";
  iframe.style.border = "none";
  iframe.style.zIndex = "-9999";
  iframe.style.opacity = "0.01";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

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
    const rawHtml = generateInvoiceHtml(payment, business, { isPreview: false, isExport: true });
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

    const invoiceCard = doc.querySelector(".invoice-card") || doc.body;

    const canvas = await html2canvas(invoiceCard, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
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

    // A4 portrait is 210mm x 297mm
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, 297), undefined, "FAST");
    pdf.save(fileName);
  } catch (err) {
    console.error("Direct invoice PDF download failed:", err);
    throw err;
  } finally {
    window.CanvasRenderingContext2D.prototype.createPattern = origCreatePattern;
    try {
      iframe.remove();
    } catch (e) {}
  }
}
