"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  UserCheck,
  ArrowLeft,
  Download,
  ExternalLink,
  Printer,
  Sparkles,
} from "lucide-react";
import { invoiceApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { generateInvoiceHtml, downloadInvoicePdf } from "@shared/lib/invoice-generator";

export default function InvoiceVerificationPage({ params }) {
  // Unwrap Next.js dynamic route params
  const resolvedParams = use(params);
  const invoiceNumber = resolvedParams?.invoiceNumber || "";
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorState, setErrorState] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkInvoice() {
      if (!invoiceNumber) {
        if (isMounted) {
          setErrorState({
            type: "INVALID",
            title: "INVOICE COULD NOT BE VERIFIED",
            message: "An invoice number is required for verification.",
          });
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const res = await invoiceApi.verify(invoiceNumber, token);

        if (!isMounted) return;

        if (res && res.verified) {
          setData(res);
          setErrorState(null);
        } else if (res && (res.isRevoked || res.status === "REVOKED")) {
          setErrorState({
            type: "REVOKED",
            title: "INVOICE REVOKED",
            message:
              res.message ||
              "This invoice is no longer considered a valid RIFAH payment document.",
            reason: res.revokedReason,
            revokedAt: res.revokedAt,
          });
        } else {
          setErrorState({
            type: "INVALID",
            title: "INVOICE COULD NOT BE VERIFIED",
            message:
              res?.message ||
              "We could not find a valid RIFAH invoice matching this verification request.",
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorState({
          type: "INVALID",
          title: "INVOICE COULD NOT BE VERIFIED",
          message:
            err?.message ||
            "We could not find a valid RIFAH invoice matching this verification request.",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkInvoice();

    return () => {
      isMounted = false;
    };
  }, [invoiceNumber, token]);

  const getPaymentRecord = () => {
    if (!data) return null;
    return {
      invoiceNumber: data.invoiceNumber || invoiceNumber,
      amount: data.amountPaid || 0,
      subtotal: data.subtotal || 0,
      gstAmount: data.gstAmount || 0,
      gstRate: data.gstRate || 18,
      description: data.membershipPlan || "Membership Subscription",
      paidAt: data.paymentDate,
      method: data.paymentMethod || "Razorpay (UPI)",
      transactionId: data.transactionId || "",
      verificationToken: token || "",
      payer: { name: data.customerName, membershipId: data.membershipId },
      business: { name: data.customerName, membershipId: data.membershipId },
    };
  };

  const handleViewInvoice = () => {
    const paymentRecord = getPaymentRecord();
    if (!paymentRecord) return;
    const html = generateInvoiceHtml(paymentRecord, paymentRecord.business, {
      isPreview: false,
      autoprint: false,
    });
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const handleDownloadPdf = async () => {
    const paymentRecord = getPaymentRecord();
    if (!paymentRecord) return;
    try {
      await downloadInvoicePdf(paymentRecord, paymentRecord.business);
    } catch (err) {
      const pdfUrl = invoiceApi.downloadPdfUrl(invoiceNumber, token);
      window.open(pdfUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1F33] flex flex-col justify-between selection:bg-[#0088D1]/20">
      {/* Top subtle brand bar */}
      <header className="border-b border-slate-200 bg-white shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/rifah-logo.png"
              alt="RIFAH Chamber of Commerce and Industry"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="border-l border-slate-200 pl-3">
              <span className="block text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Official Verification Portal
              </span>
              <span className="text-sm font-bold text-[#0B1F33]">
                RIFAH Chamber of Commerce & Industry
              </span>
            </div>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Validation</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-[#0088D1] border-t-transparent mb-4"></div>
            <p className="text-base font-semibold text-[#0B1F33]">
              Verifying invoice against RIFAH records...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Validating cryptographic security token & payment authenticity
            </p>
          </div>
        ) : errorState ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header Red/Amber state banner */}
            <div
              className={`p-6 sm:p-8 text-center text-white ${
                errorState.type === "REVOKED"
                  ? "bg-gradient-to-r from-[#C90000] to-rose-700"
                  : "bg-gradient-to-r from-amber-600 to-rose-600"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3 border border-white/30">
                {errorState.type === "REVOKED" ? (
                  <AlertTriangle className="w-9 h-9 text-white" />
                ) : (
                  <XCircle className="w-9 h-9 text-white" />
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {errorState.title}
              </h1>
              <p className="text-sm text-white/90 mt-1 max-w-md mx-auto">
                {errorState.message}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {errorState.type === "REVOKED" ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 text-sm">
                  <p className="font-bold mb-1">Status: REVOKED</p>
                  <p className="text-xs text-rose-700">
                    This document was officially revoked by RIFAH Chamber administration. It is no longer valid for tax, legal, or membership purposes.
                  </p>
                  {errorState.reason && (
                    <p className="mt-2 text-xs font-semibold">
                      Reason: <span className="font-normal">{errorState.reason}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Possible Reasons:
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
                    <li>Invoice number is incorrect or does not exist in chamber records.</li>
                    <li>Verification link is incomplete, expired, or tampered with.</li>
                    <li>Invoice has been revoked or archived.</li>
                  </ul>
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                    If you believe this is in error, please contact RIFAH Secretariat at{" "}
                    <a
                      href="mailto:info@rifah.org"
                      className="text-[#0088D1] font-semibold hover:underline"
                    >
                      info@rifah.org
                    </a>
                    .
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto flex-1 h-11 font-semibold rounded-xl border-slate-300"
                >
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to RIFAH Home
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full sm:w-auto flex-1 h-11 font-semibold rounded-xl bg-[#0B1F33] hover:bg-[#071422] text-white"
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Top Brand Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-6 sm:p-8 text-center text-white relative">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3 border border-white/40 shadow-inner">
                <CheckCircle2 className="w-9 h-9 text-white stroke-[2.5]" />
              </div>
              <div className="inline-block bg-white/20 backdrop-blur-sm text-emerald-100 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 border border-white/30">
                Official RIFAH Invoice
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                PAYMENT VERIFIED
              </h1>
              <p className="text-sm text-emerald-100/90 mt-1 max-w-lg mx-auto">
                This invoice has been successfully verified against official RIFAH Chamber of Commerce records.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Core Badge Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Invoice Number
                  </span>
                  <span className="text-base font-extrabold text-[#0B1F33] font-mono">
                    {data.invoiceNumber}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Membership ID
                  </span>
                  <span className="text-base font-extrabold text-[#0088D1] font-mono">
                    {data.membershipId || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Payment Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {data.paymentStatus || "PAID"}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Billed To */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0088D1]" />
                    Billed To
                  </span>
                  <p className="text-base font-bold text-[#0B1F33] leading-snug">
                    {data.customerName}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {data.chapter || "Chamber Main Desk"}
                  </p>
                </div>

                {/* Membership Plan */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Membership
                  </span>
                  <p className="text-base font-bold text-[#0B1F33] leading-snug">
                    {data.membershipPlan}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    Status: <strong className="text-emerald-700">ACTIVE</strong>
                  </p>
                </div>

                {/* Amount Paid */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Amount Paid
                  </span>
                  <p className="text-xl font-extrabold text-[#0B1F33]">
                    {data.currency === "USD" ? "$" : "₹"}
                    {Number(data.amountPaid || 0).toLocaleString(
                      data.currency === "USD" ? "en-US" : "en-IN"
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Includes GST ({data.gstRate || 18}%)
                  </p>
                </div>

                {/* Payment Method & Date */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0088D1]" />
                    Payment Method & Date
                  </span>
                  <p className="text-sm font-bold text-[#0B1F33]">
                    {data.paymentMethod || "Razorpay (UPI)"}
                  </p>
                  <p className="text-xs text-slate-600">
                    Paid On: {data.paymentDate}
                  </p>
                </div>
              </div>

              {/* Membership Validity */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Membership Validity
                  </span>
                  <span className="text-sm font-bold text-[#0B1F33]">
                    {data.validFrom} &rarr; {data.validUntil}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Issued by:</span>
                  <span className="text-xs font-bold text-[#0B1F33]">
                    {data.issuedBy || "RIFAH Chamber of Commerce & Industry"}
                  </span>
                </div>
              </div>

              {/* Authenticity Checklist */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs font-semibold text-emerald-900 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Invoice authenticity confirmed against RIFAH records</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Verified payment record and official transaction ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Issued by RIFAH Chamber of Commerce & Industry</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownloadPdf}
                  className="w-full sm:w-auto flex-1 h-12 rounded-xl bg-[#0088D1] hover:bg-[#0277bd] text-white font-bold shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice PDF
                </Button>
                <Button
                  onClick={handleViewInvoice}
                  variant="outline"
                  className="w-full sm:w-auto flex-1 h-12 rounded-xl border-slate-300 text-[#0B1F33] font-semibold hover:bg-slate-50"
                >
                  <Printer className="w-4 h-4 mr-2 text-slate-600" />
                  View &amp; Print
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full sm:w-auto h-12 rounded-xl text-slate-600 hover:text-[#0B1F33] font-semibold"
                >
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          RIFAH Chamber of Commerce & Industry
        </p>
        <p className="mt-1">Together for Sustainable Future · info@rifah.org</p>
      </footer>
    </div>
  );
}
