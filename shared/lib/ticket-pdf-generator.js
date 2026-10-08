// Official RIFAH Digital Entry Pass & Ticket PDF Generator

export function generateTicketHtml(ticketData) {
  if (!ticketData) return "";

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoUrl = `${origin}/rifah-logo.png`;

  const {
    ticketId = "RIFAH-EVT-XXXX",
    attendeeName = "Attendee",
    attendeeEmail = "",
    attendeeCompany = "",
    eventTitle = "RIFAH Event",
    eventDate = "",
    eventTime = "",
    eventVenue = "RIFAH Chamber Hall",
    eventCity = "",
    ticketType = "Member Pass",
    paymentStatus = "PAID",
    amountPaid = 0,
    verificationUrl = `${origin}/verify/ticket/${ticketId}`,
  } = ticketData;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    verificationUrl
  )}&margin=0`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>RIFAH Entry Pass - ${ticketId}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Space+Mono:wght@700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
          body {
            background-color: #070e17;
            color: #ffffff;
            padding: 30px 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .ticket-card {
            width: 100%;
            max-width: 480px;
            background: #0b1522;
            border-radius: 24px;
            border: 1px solid #1e293b;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
            position: relative;
          }
          .brand-top {
            background: linear-gradient(135deg, #0b1f33 0%, #0369a1 100%);
            padding: 24px;
            text-align: center;
            border-bottom: 2px dashed #1e293b;
            position: relative;
          }
          .brand-logo {
            height: 38px;
            object-fit: contain;
            margin-bottom: 8px;
          }
          .pass-tag {
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 800;
            color: #38bdf8;
          }
          .event-title {
            font-size: 20px;
            font-weight: 900;
            margin-top: 4px;
            color: #ffffff;
            line-height: 1.25;
          }
          .notch-left, .notch-right {
            position: absolute;
            bottom: -14px;
            width: 28px;
            height: 28px;
            background: #070e17;
            border-radius: 50%;
            z-index: 10;
          }
          .notch-left { left: -14px; }
          .notch-right { right: -14px; }
          
          .ticket-body {
            padding: 28px 24px;
          }
          .qr-box {
            background: #ffffff;
            padding: 14px;
            border-radius: 18px;
            width: 180px;
            height: 180px;
            margin: 0 auto 16px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
          }
          .qr-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .scan-label {
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
          }
          .info-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }
          .info-cell {
            background: #0f1c2d;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid #1e293b;
          }
          .cell-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 800;
            letter-spacing: 0.8px;
            margin-bottom: 3px;
          }
          .cell-value {
            font-size: 13px;
            font-weight: 700;
            color: #f8fafc;
            word-break: break-word;
          }
          .cell-value.highlight {
            color: #38bdf8;
            font-family: 'Space Mono', monospace;
          }
          .cell-value.success {
            color: #34d399;
          }
          .footer-note {
            text-align: center;
            margin-top: 18px;
            padding-top: 14px;
            border-top: 1px solid #1e293b;
            font-size: 10.5px;
            color: #64748b;
          }
          @media print {
            body { background: #fff !important; padding: 0 !important; color: #0b1f33 !important; }
            .ticket-card { border: 1px solid #cbd5e1 !important; box-shadow: none !important; background: #fff !important; max-width: 100% !important; border-radius: 0 !important; }
            .brand-top { background: #0b1f33 !important; color: #fff !important; }
            .event-title { color: #fff !important; }
            .info-cell { background: #f8fafc !important; border-color: #e2e8f0 !important; }
            .cell-value { color: #0b1f33 !important; }
            .cell-value.highlight { color: #0284c7 !important; }
            .cell-value.success { color: #059669 !important; }
            .notch-left, .notch-right { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-card">
          <div class="brand-top">
            <img src="${logoUrl}" class="brand-logo" alt="RIFAH" onerror="this.style.display='none'" />
            <div class="pass-tag">DIGITAL ENTRY PASS</div>
            <div class="event-title">${eventTitle}</div>
            <div class="notch-left"></div>
            <div class="notch-right"></div>
          </div>

          <div class="ticket-body">
            <div class="qr-box">
              <img src="${qrImageUrl}" alt="Entry QR" />
            </div>
            <div class="scan-label">SCAN AT ENTRANCE FOR ENTRY VERIFICATION</div>

            <div class="info-row">
              <div class="info-cell" style="grid-column: span 2;">
                <div class="cell-label">ATTENDEE NAME</div>
                <div class="cell-value" style="font-size: 15px;">${attendeeName} ${attendeeCompany ? `(${attendeeCompany})` : ""}</div>
              </div>
            </div>

            <div class="info-row">
              <div class="info-cell">
                <div class="cell-label">TICKET ID</div>
                <div class="cell-value highlight">${ticketId}</div>
              </div>
              <div class="info-cell">
                <div class="cell-label">PASS TYPE</div>
                <div class="cell-value">${ticketType}</div>
              </div>
            </div>

            <div class="info-row">
              <div class="info-cell">
                <div class="cell-label">EVENT DATE & TIME</div>
                <div class="cell-value">${eventDate || "Upcoming"}${eventTime ? ` • ${eventTime}` : ""}</div>
              </div>
              <div class="info-cell">
                <div class="cell-label">VENUE / LOCATION</div>
                <div class="cell-value">${eventVenue}${eventCity ? `, ${eventCity}` : ""}</div>
              </div>
            </div>

            <div class="info-row">
              <div class="info-cell">
                <div class="cell-label">REGISTRATION</div>
                <div class="cell-value success">CONFIRMED</div>
              </div>
              <div class="info-cell">
                <div class="cell-label">PAYMENT STATUS</div>
                <div class="cell-value success">${paymentStatus}</div>
              </div>
            </div>

            <div class="footer-note">
              RIFAH Chamber of Commerce & Industry · Official Digital Pass<br/>
              Please present this pass on your mobile device at the check-in desk.
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;
}

export async function downloadTicketPdf(ticketData) {
  if (typeof window === "undefined" || !ticketData) return;

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const ticketId = ticketData.ticketId || "PASS";
  const fileName = `RIFAH_Pass_${ticketId}.pdf`;

  const iframe = document.createElement("iframe");
  iframe.id = "rifah-ticket-export-frame";
  iframe.style.position = "fixed";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = "500px";
  iframe.style.height = "850px";
  iframe.style.border = "none";
  iframe.style.zIndex = "-9999";
  iframe.style.opacity = "0.01";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  try {
    const rawHtml = generateTicketHtml(ticketData);
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
    await new Promise((resolve) => setTimeout(resolve, 300));

    const card = doc.querySelector(".ticket-card") || doc.body;

    const canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#070e17",
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
      format: [120, 190],
    });

    const pdfWidth = 120;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    pdf.save(fileName);
  } catch (err) {
    console.error("Direct ticket PDF download failed:", err);
    // Fallback: open print window
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(generateTicketHtml(ticketData));
      printWin.document.close();
    }
  } finally {
    try {
      iframe.remove();
    } catch (e) {}
  }
}
