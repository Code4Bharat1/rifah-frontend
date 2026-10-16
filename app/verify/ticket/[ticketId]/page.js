"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ticket,
  User,
  Mail,
  Building,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Check,
  Download,
} from "lucide-react";
import { eventApi } from "@shared/lib/api-services";
import { downloadTicketPdf } from "@shared/lib/ticket-pdf-generator";
import { Button } from "@shared/components/ui/button";
import { toast } from "sonner";

function TicketVerificationContent({ params }) {
  // Unwrap Next.js dynamic route params
  const resolvedParams = use(params);
  const rawTicketId = resolvedParams?.ticketId || "";
  let cleanTicketId = rawTicketId;
  try {
    cleanTicketId = decodeURIComponent(rawTicketId).trim();
  } catch (_) {}

  const searchParams = useSearchParams();
  let token = searchParams.get("token") || "";

  if (cleanTicketId.includes("?")) {
    const parts = cleanTicketId.split("?");
    cleanTicketId = parts[0].trim();
    if (!token && parts[1]?.includes("token=")) {
      token = new URLSearchParams(parts[1]).get("token") || "";
    }
  }

  // Remove trailing or leading slashes
  cleanTicketId = cleanTicketId.replace(/^\/+|\/+$/g, "").trim();
  const ticketId = cleanTicketId;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [alreadyCheckedInBanner, setAlreadyCheckedInBanner] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyTicketData() {
      if (!ticketId) {
        if (isMounted) {
          setErrorState({
            type: "INVALID",
            title: "INVALID TICKET",
            message: "A Ticket ID is required for verification.",
          });
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const res = await eventApi.verifyTicket(ticketId, token);

        if (!isMounted) return;

        // Unpack API response wrapper (res.data or res)
        const ticketData = res?.data || res;

        if (ticketData && ticketData.verified) {
          setData(ticketData);
          setErrorState(null);
          if (ticketData.checkedIn) {
            setAlreadyCheckedInBanner({
              checkedInAt: ticketData.checkedInAt
                ? new Date(ticketData.checkedInAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Earlier today",
              checkedInBy: ticketData.checkedInBy || "Event Staff",
            });
          }
        } else if (ticketData && ticketData.status === "CANCELLED") {
          setErrorState({
            type: "CANCELLED",
            title: "TICKET CANCELLED",
            message: ticketData.message || "This event ticket has been cancelled.",
          });
        } else if (ticketData && ticketData.status === "REFUNDED") {
          setErrorState({
            type: "REFUNDED",
            title: "TICKET REFUNDED",
            message: ticketData.message || "This registration has been refunded.",
          });
        } else if (ticketData && ticketData.status === "UNPAID") {
          setErrorState({
            type: "UNPAID",
            title: "PAYMENT NOT COMPLETED",
            message:
              ticketData.message || "Payment has not been completed for this event pass.",
          });
        } else {
          setErrorState({
            type: "INVALID",
            title: "INVALID TICKET",
            message:
              ticketData?.message ||
              res?.message ||
              "This QR code does not correspond to a valid RIFAH event ticket.",
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorState({
          type: "INVALID",
          title: "INVALID TICKET",
          message:
            err?.data?.message ||
            err?.message ||
            "This QR code does not correspond to a valid RIFAH event ticket.",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyTicketData();

    return () => {
      isMounted = false;
    };
  }, [ticketId, token]);

  const handleDownloadPass = async () => {
    if (!data) return;
    try {
      setDownloadingPdf(true);
      await downloadTicketPdf({
        ticketId: data.ticketId,
        attendeeName: data.attendeeName,
        attendeeEmail: data.attendeeEmail,
        attendeeCompany: data.attendeeCompany,
        eventTitle: data.eventTitle,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        eventVenue: data.eventVenue || data.eventCity || "Chamber Main Hall",
        eventCity: data.eventCity || "",
        ticketType: data.ticketType,
        paymentStatus: data.paymentStatus,
        amountPaid: data.amountPaid || 0,
        verificationUrl: typeof window !== "undefined" ? window.location.href : "",
      });
      toast.success("Ticket PDF downloaded successfully!");
    } catch (e) {
      toast.error("Could not download ticket PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070E17] text-slate-100 flex flex-col justify-between selection:bg-[#0088D1]/30">
      {/* Official Header */}
      <header className="border-b border-slate-800 bg-[#0B1522]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/rifah-logo.png"
              alt="RIFAH"
              className="h-8 w-auto object-contain brightness-110"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="border-l border-slate-700 pl-2.5">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-sky-400">
                Official Entry Pass
              </span>
              <span className="text-xs font-bold text-white">
                RIFAH Chamber of Commerce
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Pass</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-8">
        {loading ? (
          <div className="bg-[#0B1522] rounded-3xl border border-slate-800 p-10 text-center shadow-xl">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-sky-400 border-t-transparent mb-4"></div>
            <p className="text-base font-semibold text-white">
              Verifying event pass credentials...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Checking cryptographic token and attendee record
            </p>
          </div>
        ) : errorState ? (
          /* ERROR / INVALID / CANCELLED STATE */
          <div className="bg-[#0B1522] rounded-3xl border border-rose-900/40 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-b from-rose-900/60 to-rose-950/80 p-8 text-center border-b border-rose-800/50">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 mx-auto flex items-center justify-center mb-3 text-rose-400">
                {errorState.type === "CANCELLED" || errorState.type === "REFUNDED" ? (
                  <AlertTriangle className="w-9 h-9" />
                ) : (
                  <XCircle className="w-9 h-9" />
                )}
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                {errorState.title}
              </h1>
              <p className="text-sm text-rose-200/90 mt-1.5 max-w-sm mx-auto">
                {errorState.message}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-white uppercase tracking-wider text-[11px]">
                  Validation Notice:
                </p>
                <p>
                  This QR scan did not match an active entry pass. Please check your registered email or visit the help desk at the event venue.
                </p>
              </div>

              <Button
                asChild
                className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                <Link href="/events">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  View All Events
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* SUCCESSFUL VERIFIED TICKET STATE */
          <div className="space-y-4">
            {/* Top Status Banner */}
            {data.checkedIn || alreadyCheckedInBanner ? (
              <div className="bg-amber-950/70 border border-amber-600/70 rounded-2xl p-4 text-amber-200 flex items-start gap-3 shadow-lg">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                    ALREADY CHECKED IN
                  </h3>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    Checked in at:{" "}
                    <strong>
                      {alreadyCheckedInBanner?.checkedInAt ||
                        (data.checkedInAt
                          ? new Date(data.checkedInAt).toLocaleString("en-GB")
                          : "Earlier")}
                    </strong>
                  </p>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Checked in by:{" "}
                    <strong>
                      {alreadyCheckedInBanner?.checkedInBy ||
                        data.checkedInBy ||
                        "Event Desk Staff"}
                    </strong>
                  </p>
                  <p className="text-[11px] text-amber-400 font-semibold mt-1">
                    ✓ Entry record confirmed in chamber registry.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/70 border border-emerald-600/70 rounded-2xl p-4 text-emerald-200 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300">
                      TICKET VERIFIED ✓
                    </h3>
                    <p className="text-xs text-emerald-300/80">
                      Official pass is valid for event entry
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 uppercase tracking-wider">
                  VALID PASS
                </span>
              </div>
            )}

            {/* Ticket Card */}
            <div className="bg-[#0B1522] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
              {/* Notches on sides for ticket feel */}
              <div className="absolute top-44 -left-3.5 w-7 h-7 rounded-full bg-[#070E17] border border-slate-800 z-10"></div>
              <div className="absolute top-44 -right-3.5 w-7 h-7 rounded-full bg-[#070E17] border border-slate-800 z-10"></div>

              {/* Event Header */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-[#0F1E30] border-b border-dashed border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-sky-400 uppercase tracking-widest">
                  <span>RIFAH OFFICIAL EVENT</span>
                  <span className="text-slate-400">{data.ticketType}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {data.eventTitle}
                </h2>
                <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-slate-300 pt-1 font-medium">
                  {data.eventDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      {data.eventDate}
                    </span>
                  )}
                  {data.eventTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      {data.eventTime}
                    </span>
                  )}
                  {data.eventVenue && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      {data.eventVenue}
                    </span>
                  )}
                </div>
              </div>

              {/* Attendee Details Grid */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Attendee Name */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Attendee Name
                    </span>
                    <p className="text-base font-extrabold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-400 shrink-0" />
                      {data.attendeeName}
                    </p>
                    {data.attendeeCompany && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {data.attendeeCompany}
                      </p>
                    )}
                  </div>

                  {/* Ticket ID */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Ticket ID
                    </span>
                    <p className="text-base font-extrabold text-sky-400 font-mono flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-sky-400 shrink-0" />
                      {data.ticketId}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{data.attendeeEmail || "N/A"}</span>
                    </p>
                  </div>
                </div>

                {/* Badges strip */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Pass Type
                    </span>
                    <span className="text-xs font-bold text-white">
                      {data.ticketType}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Payment
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {data.paymentStatus}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Registration
                    </span>
                    <span className="text-xs font-bold text-sky-400">
                      {data.registrationStatus}
                    </span>
                  </div>
                </div>

                {/* Entry Notice & Download Ticket Action */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-3 text-xs text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-white text-xs">
                        Official Chamber Entry Pass
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Please present this digital pass or your downloaded ticket at the event reception / entrance desk. The desk officer will scan this ticket to issue your badge and allow entry.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDownloadPass}
                    disabled={downloadingPdf}
                    variant="outline"
                    className="w-full h-11 rounded-xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{downloadingPdf ? "Generating PDF..." : "Download Official Ticket PDF"}</span>
                  </Button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>RIFAH Chamber of Commerce</span>
                <span className="font-mono text-slate-500">
                  {data.ticketId}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Page Footer */}
      <footer className="border-t border-slate-800 bg-[#0B1522] py-4 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">
          RIFAH Chamber of Commerce & Industry
        </p>
        <p className="mt-0.5 text-[11px]">
          Together for Sustainable Future · Event Pass Portal
        </p>
      </footer>
    </div>
  );
}

export default function TicketVerificationPage(props) {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-mono text-sm">Verifying ticket...</div>}>
      <TicketVerificationContent {...props} />
    </React.Suspense>
  );
}
