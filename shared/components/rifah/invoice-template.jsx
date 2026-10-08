"use client";

import React, { useId } from "react";

// ============================================================================
// OFFICIAL COLOR PALETTE CONSTANTS
// ============================================================================
export const INVOICE_COLORS = {
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

// ============================================================================
// DEFAULT REFERENCE INVOICE DATA (100% IDENTICAL TO SPECIFICATION)
// ============================================================================
export const defaultInvoiceData = {
  transactionId: "pay_3J9H7F49Q28",
  paymentDate: "02 Oct 2026, 11:45 AM",
  paymentMethod: "Razorpay (UPI)",
  invoiceNo: "INV-2026-0937",
  membershipId: "RIFAH-DIA-1026",
  invoiceDate: "02 Oct 2026",
  paymentStatus: "Paid",
  billedTo: {
    name: "ABC Enterprises Pvt. Ltd.",
    address:
      "123 Business Park, Bandra Kurla Complex,\nMumbai - 400051, Maharashtra, India",
  },
  membership: {
    tier: "Diamond Membership",
    validityFrom: "02 Oct 2026",
    validityTo: "01 Oct 2027",
    billingCycle: "Annual (1 Year)",
  },
  items: [
    {
      description: "Diamond Chamber Membership (Annual)",
      qty: 1,
      amount: 50000,
    },
  ],
  gstPercent: 18,
  notes: [
    "This is a computer generated invoice and does not require a signature.",
    "This payment is non-refundable and subject to RIFAH terms & conditions.",
    "For any queries, contact us at info@rifah.org",
  ],
  contact: {
    website: "www.rifah.org",
    email: "info@rifah.org",
    phone: "+91 88977 83151",
  },
  verificationUrl: "https://rifah.org/verify/invoice/INV-2026-0937",
};

// ============================================================================
// CURRENCY FORMATTER
// ============================================================================
export function formatInr(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// ============================================================================
// 1. DECORATIVE CORNERS
// ============================================================================
export function DecorativeCorners() {
  return (
    <>
      {/* Top-Right Corner Navy Polygon + Red Diagonal Wedge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "170px",
          height: "75px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <svg
          width="170"
          height="75"
          viewBox="0 0 170 75"
          fill="none"
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          <polygon points="40,0 170,0 170,38" fill={INVOICE_COLORS.navy} />
          <polygon points="125,25 170,38 170,68" fill={INVOICE_COLORS.red} />
        </svg>
      </div>

      {/* Bottom-Left Corner Navy Polygon + Red Wedge */}
      <div
        style={{
          position: "absolute",
          bottom: "44px",
          left: 0,
          width: "75px",
          height: "35px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <svg
          width="75"
          height="35"
          viewBox="0 0 75 35"
          fill="none"
          style={{ display: "block" }}
        >
          <polygon points="0,0 0,35 75,35" fill={INVOICE_COLORS.navy} />
          <polygon points="0,18 0,35 35,35" fill={INVOICE_COLORS.red} />
        </svg>
      </div>
    </>
  );
}

// ============================================================================
// 2. HEADER COMPONENT
// ============================================================================
export function Header({ logoUrl = "/rifah-logo.png" }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "24px",
      }}
    >
      {/* LEFT: Official Logo */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={logoUrl}
          alt="RIFAH Chamber of Commerce and Industry"
          style={{
            height: "70px",
            maxWidth: "330px",
            objectFit: "contain",
            display: "block",
          }}
          onError={(e) => {
            // Fallback text mark if image not accessible in isolation
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* RIGHT: Invoice Title, Confirmation, and Badges */}
      <div style={{ textAlign: "right", position: "relative", zIndex: 5, marginTop: "8px" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 900,
            color: INVOICE_COLORS.navy,
            letterSpacing: "0.5px",
            lineHeight: 1,
            margin: 0,
            position: "relative",
            zIndex: 5,
          }}
        >
          INVOICE
        </h1>
        <p
          style={{
            fontSize: "13.5px",
            color: INVOICE_COLORS.textMuted,
            fontWeight: 500,
            margin: "4px 0 0 0",
          }}
        >
          Payment Confirmation
        </p>

        {/* Two Outlined Rounded Pills with Divider */}
        <div style={{ marginTop: "8px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: `1px solid #94A3B8`,
              borderRadius: "9999px",
              padding: "3px 14px",
              fontSize: "10.5px",
              fontWeight: 600,
              color: "#334155",
              backgroundColor: INVOICE_COLORS.white,
            }}
          >
            <span>Original Copy</span>
            <span style={{ color: "#CBD5E1" }}>|</span>
            <span>Invoice for Membership</span>
          </div>
        </div>

        {/* Red Accent Line */}
        <div
          style={{
            width: "42px",
            height: "3px",
            backgroundColor: INVOICE_COLORS.red,
            marginLeft: "auto",
            marginTop: "8px",
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 3. PAYMENT SUCCESS BOX
// ============================================================================
export function PaymentSuccessBox({
  transactionId,
  paymentDate,
  paymentMethod,
}) {
  const isCard = /card/i.test(paymentMethod || "");

  return (
    <div
      style={{
        backgroundColor: INVOICE_COLORS.successLightBg,
        border: `1px solid ${INVOICE_COLORS.successBorder}`,
        borderRadius: "12px",
        padding: "16px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >
      {/* Left: Circle check + Text */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            backgroundColor: INVOICE_COLORS.successGreen,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: INVOICE_COLORS.successGreen,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Payment Successful
          </h2>
          <p
            style={{
              fontSize: "11.5px",
              color: "#166534",
              margin: "2px 0 0 0",
              fontWeight: 500,
            }}
          >
            Your membership payment has been received successfully.
          </p>
        </div>
      </div>

      {/* Right: Transaction Details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          fontSize: "11.5px",
          textAlign: "right",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <span style={{ color: INVOICE_COLORS.textMuted, fontWeight: 500 }}>
            Transaction ID
          </span>
          <span style={{ fontWeight: 700, color: INVOICE_COLORS.textDark }}>
            {transactionId}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <span style={{ color: INVOICE_COLORS.textMuted, fontWeight: 500 }}>
            Payment Date
          </span>
          <span style={{ fontWeight: 700, color: INVOICE_COLORS.textDark }}>
            {paymentDate}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <span style={{ color: INVOICE_COLORS.textMuted, fontWeight: 500 }}>
            Payment Method
          </span>
          <span
            style={{
              fontWeight: 700,
              color: INVOICE_COLORS.textDark,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isCard ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={INVOICE_COLORS.navy}
              >
                <path d="M22 2L10 10l-3 9 8-5 1-5 4-2-3 9-10 6-7 4 12-8 3-8-8 5-1 5-4 2 3-9 10-6z" />
              </svg>
            )}
            {paymentMethod}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. INFO ROW (4 EQUAL COLUMNS)
// ============================================================================
export function InfoRow({
  invoiceNo,
  membershipId,
  invoiceDate,
  paymentStatus = "Paid",
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.15fr 1.2fr 1fr 0.95fr",
        gap: "12px",
        borderBottom: `1px solid #F1F5F9`,
        paddingBottom: "16px",
        marginBottom: "24px",
        alignItems: "flex-start",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "11px",
            color: INVOICE_COLORS.textMuted,
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          Invoice No.
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: INVOICE_COLORS.textDark,
          }}
        >
          {invoiceNo}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: "11px",
            color: INVOICE_COLORS.textMuted,
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          Membership ID
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: INVOICE_COLORS.textDark,
          }}
        >
          {membershipId}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: "11px",
            color: INVOICE_COLORS.textMuted,
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          Invoice Date
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: INVOICE_COLORS.textDark,
          }}
        >
          {invoiceDate}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: "11px",
            color: INVOICE_COLORS.textMuted,
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          Payment Status
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: INVOICE_COLORS.successLightBg,
            color: INVOICE_COLORS.successGreen,
            padding: "3px 16px",
            borderRadius: "9999px",
            fontSize: "11.5px",
            fontWeight: 700,
            border: `1px solid ${INVOICE_COLORS.successBorder}`,
            width: "fit-content",
          }}
        >
          {paymentStatus}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. BILLED TO & MEMBERSHIP CARD
// ============================================================================
export function BilledToAndMembership({ billedTo, membership }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.18fr 0.82fr",
        gap: "16px",
        marginBottom: "26px",
      }}
    >
      {/* Billed To Box */}
      <div
        style={{
          border: `1px solid ${INVOICE_COLORS.borders}`,
          borderRadius: "12px",
          padding: "16px 20px",
          backgroundColor: INVOICE_COLORS.white,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              backgroundColor: INVOICE_COLORS.lightBlue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="9" y1="6" x2="9" y2="6.01" />
              <line x1="15" y1="6" x2="15" y2="6.01" />
              <line x1="9" y1="10" x2="9" y2="10.01" />
              <line x1="15" y1="10" x2="15" y2="10.01" />
              <line x1="9" y1="14" x2="9" y2="14.01" />
              <line x1="15" y1="14" x2="15" y2="14.01" />
              <line x1="9" y1="18" x2="15" y2="18" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: INVOICE_COLORS.textDark,
            }}
          >
            Billed To
          </span>
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: INVOICE_COLORS.textDark,
            marginBottom: "4px",
          }}
        >
          {billedTo?.name}
        </div>
        <div
          style={{
            fontSize: "11.5px",
            color: INVOICE_COLORS.textMuted,
            lineHeight: 1.5,
            whiteSpace: "pre-line",
          }}
        >
          {billedTo?.address}
        </div>
      </div>

      {/* Membership Card Box */}
      <div
        style={{
          border: `1px solid ${INVOICE_COLORS.borders}`,
          borderRadius: "12px",
          padding: "16px 20px",
          backgroundColor: INVOICE_COLORS.white,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              backgroundColor: INVOICE_COLORS.lightBlue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12l4 6-10 12L2 9z" />
              <path d="M11 3 L8 9 L12 21 L16 9 L13 3" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: INVOICE_COLORS.navy,
            }}
          >
            {membership?.tier}
          </span>
        </div>
        <div style={{ lineHeight: 1.6, marginTop: "6px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11.5px",
            }}
          >
            <span style={{ color: INVOICE_COLORS.textMuted }}>Validity</span>
            <span
              style={{ fontWeight: 700, color: INVOICE_COLORS.textDark }}
            >
              {membership?.validityFrom} &ndash; {membership?.validityTo}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11.5px",
              marginTop: "4px",
            }}
          >
            <span style={{ color: INVOICE_COLORS.textMuted }}>Billing Cycle</span>
            <span
              style={{ fontWeight: 700, color: INVOICE_COLORS.textDark }}
            >
              {membership?.billingCycle}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. ITEMS TABLE
// ============================================================================
export function ItemsTable({ items = [], gstPercent = 18 }) {
  const subtotal = items.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );
  const gstAmount = Math.round((subtotal * gstPercent) / 100);
  const total = subtotal + gstAmount;

  return (
    <div
      style={{
        border: `1px solid ${INVOICE_COLORS.borders}`,
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "26px",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: INVOICE_COLORS.lightBlue }}>
            <th
              style={{
                width: "45px",
                textAlign: "center",
                padding: "12px 18px",
                fontSize: "11.5px",
                fontWeight: 800,
                color: INVOICE_COLORS.navy,
                borderBottom: `1px solid ${INVOICE_COLORS.borders}`,
              }}
            >
              #
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "12px 18px",
                fontSize: "11.5px",
                fontWeight: 800,
                color: INVOICE_COLORS.navy,
                borderBottom: `1px solid ${INVOICE_COLORS.borders}`,
              }}
            >
              Description
            </th>
            <th
              style={{
                width: "70px",
                textAlign: "center",
                padding: "12px 18px",
                fontSize: "11.5px",
                fontWeight: 800,
                color: INVOICE_COLORS.navy,
                borderBottom: `1px solid ${INVOICE_COLORS.borders}`,
              }}
            >
              Qty
            </th>
            <th
              style={{
                width: "150px",
                textAlign: "right",
                padding: "12px 18px",
                fontSize: "11.5px",
                fontWeight: 800,
                color: INVOICE_COLORS.navy,
                borderBottom: `1px solid ${INVOICE_COLORS.borders}`,
              }}
            >
              Amount (INR)
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={idx}
              style={{ borderBottom: `1px solid #F1F5F9`, backgroundColor: "#FFFFFF" }}
            >
              <td
                style={{
                  textAlign: "center",
                  padding: "16px 18px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: INVOICE_COLORS.textDark,
                }}
              >
                {idx + 1}
              </td>
              <td
                style={{
                  padding: "16px 18px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: INVOICE_COLORS.textDark,
                }}
              >
                {item.description}
              </td>
              <td
                style={{
                  textAlign: "center",
                  padding: "16px 18px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: INVOICE_COLORS.textDark,
                }}
              >
                {item.qty}
              </td>
              <td
                style={{
                  textAlign: "right",
                  padding: "16px 18px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: INVOICE_COLORS.textDark,
                }}
              >
                {formatInr(item.amount)}
              </td>
            </tr>
          ))}

          {/* Subtotal Row */}
          <tr>
            <td colSpan={3} style={{ textAlign: "right", padding: "10px 18px 4px 18px", fontSize: "12.5px", color: INVOICE_COLORS.textMuted, fontWeight: 600 }}>
              Subtotal
            </td>
            <td style={{ textAlign: "right", padding: "10px 18px 4px 18px", fontSize: "12.5px", fontWeight: 700, color: INVOICE_COLORS.textDark }}>
              {formatInr(subtotal)}
            </td>
          </tr>

          {/* GST Row */}
          <tr>
            <td colSpan={3} style={{ textAlign: "right", padding: "4px 18px 10px 18px", fontSize: "12.5px", color: INVOICE_COLORS.textMuted, fontWeight: 600 }}>
              GST ({gstPercent}%)
            </td>
            <td style={{ textAlign: "right", padding: "4px 18px 10px 18px", fontSize: "12.5px", fontWeight: 700, color: INVOICE_COLORS.textDark }}>
              {formatInr(gstAmount)}
            </td>
          </tr>

          {/* Total Paid Row */}
          <tr style={{ backgroundColor: INVOICE_COLORS.lightBlue }}>
            <td colSpan={3} style={{ textAlign: "right", padding: "14px 20px", fontSize: "15px", fontWeight: 800, color: INVOICE_COLORS.navy }}>
              Total Paid
            </td>
            <td style={{ textAlign: "right", padding: "14px 20px", fontSize: "16px", fontWeight: 900, color: INVOICE_COLORS.navy }}>
              {formatInr(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// 7. NOTES + QR CODE (TWO COLUMNS)
// ============================================================================
export function NotesAndQR({ notes = [], verificationUrl = "https://rifah.org" }) {
  const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
    verificationUrl
  )}&margin=0`;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `1px solid #F1F5F9`,
        paddingTop: "20px",
        marginBottom: "28px",
      }}
    >
      {/* Notes Left */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", maxWidth: "480px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            backgroundColor: INVOICE_COLORS.lightBlue,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 800,
              color: INVOICE_COLORS.textDark,
              marginBottom: "6px",
            }}
          >
            Important Notes
          </div>
          <ul
            style={{
              listStyle: "disc",
              paddingLeft: "16px",
              fontSize: "11px",
              color: INVOICE_COLORS.textMuted,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* QR Box Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 14px",
          border: `1px solid ${INVOICE_COLORS.borders}`,
          borderRadius: "8px",
          backgroundColor: INVOICE_COLORS.white,
        }}
      >
        <img
          src={qrImgSrc}
          alt="Scan to Verify"
          style={{ width: "76px", height: "76px", objectFit: "contain", display: "block" }}
        />
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: INVOICE_COLORS.textDark,
              lineHeight: 1.2,
            }}
          >
            Scan to Verify
          </div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 500,
              color: INVOICE_COLORS.textMuted,
              marginTop: "3px",
              lineHeight: 1.35,
            }}
          >
            Invoice &amp; Membership
            <br />
            Details
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. SIGNATURE + BADGE (TWO COLUMNS)
// ============================================================================
export function SignatureAndBadge() {
  const gradientId = useId();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingBottom: "28px",
      }}
    >
      {/* LEFT: Authorised Signatory with Flowing Pen Stroke */}
      <div style={{ textAlign: "left" }}>
        <div style={{ height: "48px", marginBottom: "2px" }}>
          <svg
            width="150"
            height="46"
            viewBox="0 0 150 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Authentic cursive pen signature matching reference sample */}
            <path
              d="M 18 34 C 14 24, 20 8, 27 5 C 33 2, 37 7, 34 15 C 30 26, 24 37, 20 40 C 18 41, 22 38, 28 29 C 33 21, 38 17, 42 21 C 45 24, 42 29, 38 32 C 35 34, 33 31, 37 24 C 41 17, 47 19, 52 24 C 56 28, 60 26, 65 20 C 70 14, 77 17, 81 21 C 85 25, 92 23, 100 19 M 15 35 C 42 32, 76 33, 115 30 C 120 29, 124 27, 120 25 C 112 23, 98 28, 86 34"
              stroke="#0F172A"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            fontSize: "12.5px",
            fontWeight: 800,
            color: INVOICE_COLORS.textDark,
            marginTop: "2px",
          }}
        >
          Authorised Signatory
        </div>
        <div
          style={{
            fontSize: "11px",
            color: INVOICE_COLORS.textMuted,
            marginTop: "1px",
          }}
        >
          RIFAH Chamber of Commerce &amp; Industry
        </div>
      </div>

      {/* RIGHT: Unified Golden Laurel Wreath Badge with Crown & Centered Text */}
      <div style={{ textAlign: "center" }}>
        <svg
          width="280"
          height="78"
          viewBox="0 0 280 78"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A227" />
              <stop offset="100%" stopColor="#E5C158" />
            </linearGradient>
          </defs>

          {/* 5-Point Royal Golden Crown */}
          <g transform="translate(125, 2)">
            <path d="M15 1 L19 10 L27 5 L24 16 H6 L3 5 L11 10 Z" fill={`url(#${gradientId})`} />
            <circle cx="3" cy="5" r="1.5" fill="#F59E0B" />
            <circle cx="15" cy="1" r="1.5" fill="#F59E0B" />
            <circle cx="27" cy="5" r="1.5" fill="#F59E0B" />
            <circle cx="9" cy="14" r="1.2" fill="#FEF3C7" />
            <circle cx="15" cy="14" r="1.2" fill="#FEF3C7" />
            <circle cx="21" cy="14" r="1.2" fill="#FEF3C7" />
          </g>

          {/* Left Laurel Branch */}
          <g transform="translate(12, 10)">
            <path
              d="M38 58 C26 52 14 38 10 20 C9 15 10 10 13 8 C14 11 15 16 15 20 C18 34 27 45 40 52 Z"
              fill={`url(#${gradientId})`}
            />
            <path d="M16 12 C10 8 4 11 4 16 C7 18 12 18 15 15 Z" fill="#F59E0B" />
            <path d="M12 22 C6 18 4 23 4 28 C8 30 13 29 14 25 Z" fill="#F59E0B" />
            <path d="M12 32 C6 30 4 36 6 41 C9 42 14 39 14 35 Z" fill="#F59E0B" />
            <path d="M18 42 C13 43 12 49 15 53 C18 52 21 47 20 43 Z" fill="#F59E0B" />
            <path d="M28 48 C23 51 23 56 27 59 C29 57 31 52 30 49 Z" fill="#F59E0B" />
          </g>

          {/* Right Laurel Branch (Mirrored) */}
          <g transform="translate(230, 10)">
            <path
              d="M0 58 C12 52 24 38 28 20 C29 15 28 10 25 8 C24 11 23 16 23 20 C20 34 11 45 -2 52 Z"
              fill={`url(#${gradientId})`}
            />
            <path d="M22 12 C28 8 34 11 34 16 C31 18 26 18 23 15 Z" fill="#F59E0B" />
            <path d="M26 22 C32 18 34 23 34 28 C30 30 25 29 24 25 Z" fill="#F59E0B" />
            <path d="M26 32 C32 30 34 36 32 41 C29 42 24 39 24 35 Z" fill="#F59E0B" />
            <path d="M20 42 C25 43 26 49 23 53 C20 52 17 47 18 43 Z" fill="#F59E0B" />
            <path d="M10 48 C15 51 15 56 11 59 C9 57 7 52 8 49 Z" fill="#F59E0B" />
          </g>

          {/* Text inside Laurel Wreath */}
          <text
            x="140"
            y="44"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="13"
            fontWeight="800"
            fill={INVOICE_COLORS.navy}
            letterSpacing="0.3"
          >
            Official RIFAH Member
          </text>
          <text
            x="140"
            y="58"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="9.5"
            fontWeight="600"
            fill={INVOICE_COLORS.gold}
          >
            Network &bull; Grow &bull; Collaborate
          </text>
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// 9. FOOTER COMPONENT
// ============================================================================
export function Footer({ contact }) {
  return (
    <div
      style={{
        backgroundColor: INVOICE_COLORS.navy,
        color: INVOICE_COLORS.white,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 26px",
        fontSize: "11px",
        position: "relative",
        overflow: "hidden",
        zIndex: 10,
        height: "44px",
        boxSizing: "border-box",
      }}
    >
      {/* Left Contact Items */}
      <div style={{ display: "flex", gap: "26px", alignItems: "center", zIndex: 2 }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {contact?.website || "www.rifah.org"}
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {contact?.email || "info@rifah.org"}
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {contact?.phone || "+91 88977 83151"}
        </span>
      </div>

      {/* Right Angled Red Strip */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: INVOICE_COLORS.red,
          clipPath: "polygon(20px 0%, 100% 0%, 100% 100%, 0% 100%)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px 0 36px",
          fontWeight: 800,
          fontSize: "11px",
          letterSpacing: "0.5px",
          zIndex: 3,
        }}
      >
        TOGETHER FOR SUSTAINABLE FUTURE
      </div>
    </div>
  );
}

// ============================================================================
// MAIN REUSABLE DATA-DRIVEN INVOICE TEMPLATE (PIXEL-PERFECT A4 CONTAINER)
// ============================================================================
export default function InvoiceTemplate({ data = defaultInvoiceData, logoUrl = "/rifah-logo.png" }) {
  const invoice = {
    ...defaultInvoiceData,
    ...data,
    billedTo: { ...defaultInvoiceData.billedTo, ...data?.billedTo },
    membership: { ...defaultInvoiceData.membership, ...data?.membership },
    contact: { ...defaultInvoiceData.contact, ...data?.contact },
  };

  return (
    <div
      className="invoice-card-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        padding: "20px 10px",
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        className="invoice-card"
        style={{
          width: "794px",
          height: "1123px",
          backgroundColor: INVOICE_COLORS.white,
          border: `1px solid ${INVOICE_COLORS.borders}`,
          borderRadius: "4px",
          position: "relative",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* 1. Decorative Polygonal Corners */}
        <DecorativeCorners />

        {/* Inner Content Area - Full Vertical Rhythm */}
        <div
          className="main-content"
          style={{
            padding: "34px 44px 0 44px",
            position: "relative",
            zIndex: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* 2. Header */}
          <Header logoUrl={logoUrl} />

          {/* 3. Payment Success Box */}
          <PaymentSuccessBox
            transactionId={invoice.transactionId}
            paymentDate={invoice.paymentDate}
            paymentMethod={invoice.paymentMethod}
          />

          {/* 4. Info Row (4 Columns) */}
          <InfoRow
            invoiceNo={invoice.invoiceNo}
            membershipId={invoice.membershipId}
            invoiceDate={invoice.invoiceDate}
            paymentStatus={invoice.paymentStatus}
          />

          {/* 5. Billed To + Membership Card */}
          <BilledToAndMembership
            billedTo={invoice.billedTo}
            membership={invoice.membership}
          />

          {/* 6. Items Table */}
          <ItemsTable
            items={invoice.items}
            gstPercent={invoice.gstPercent}
          />

          {/* 7. Notes + QR Code */}
          <NotesAndQR
            notes={invoice.notes}
            verificationUrl={invoice.verificationUrl}
          />

          {/* 8. Signature + Laurel Badge */}
          <SignatureAndBadge />
        </div>

        {/* 9. Footer Band */}
        <Footer contact={invoice.contact} />
      </div>
    </div>
  );
}
