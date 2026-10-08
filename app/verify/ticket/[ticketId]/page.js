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
  ShieldAlert,
  ArrowLeft,
  Check,
  Sparkles,
  QrCode,
  UserCheck,
} from "lucide-react";
import { eventApi } from "@shared/lib/api-services";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { toast } from "sonner";

export default function TicketVerificationPage({ params }) {
  // Unwrap Next.js dynamic route params
  const resolvedParams = use(params);
  const ticketId = resolvedParams?.ticketId || "";
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [staffName, setStaffName] = useState("");
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

        if (res && res.verified) {
          setData(res);
          setErrorState(null);
          if (res.checkedIn) {
            setAlreadyCheckedInBanner({
              checkedInAt: res.checkedInAt
                ? new Date(res.checkedInAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Earlier today",
              checkedInBy: res.checkedInBy || "Event Staff",
            });
          }
        } else if (res && res.status === "CANCELLED") {
          setErrorState({
            type: "CANCELLED",
            title: "TICKET CANCELLED",
            message: res.message || "This event ticket has been cancelled.",
          });
        } else if (res && res.status === "REFUNDED") {
          setErrorState({
            type: "REFUNDED",
            title: "TICKET REFUNDED",
            message: res.message || "This registration has been refunded.",
          });
        } else if (res && res.status === "UNPAID") {
          setErrorState({
            type: "UNPAID",
            title: "PAYMENT NOT COMPLETED",
            message:
              res.message || "Payment has not been completed for this event pass.",
          });
        } else {
          setErrorState({
            type: "INVALID",
            title: "INVALID TICKET",
            message:
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

  const handleCheckIn = async () => {
    if (!ticketId || checkingIn) return;

    try {
      setCheckingIn(true);
      const res = await eventApi.checkInTicket(
        ticketId,
        staffName.trim() || "Event Desk Staff"
      );

      if (res && res.alreadyCheckedIn) {
        toast.warning("Attendee was already checked in!");
        setAlreadyCheckedInBanner({
          checkedInAt: res.checkedInAt || "Earlier",
          checkedInBy: res.checkedInBy || "Event Staff",
        });
        setData((prev) => ({
          ...prev,
          checkedIn: true,
          checkedInAt: res.checkedInAt,
          checkedInBy: res.checkedInBy,
        }));
      } else if (res && res.success) {
        toast.success("Attendee successfully checked in!");
        setData((prev) => ({
          ...prev,
          checkedIn: true,
          checkedInAt: res.checkedInAt,
          checkedInBy: res.checkedInBy,
        }));
      } else {
        toast.error(res?.message || "Check-in failed. Please retry.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to process check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070E17] text-slate-100 flex flex-col justify-between selection:bg-[#0088D1]/30">
      {/* Staff Check-in Header */}
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
                Staff Verification Desk
              </span>
              <span className="text-xs font-bold text-white">
                RIFAH Event Entry Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Ticket</span>
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
                  This QR scan did not match an active entry pass. Staff should advise the guest to verify their ticket email or visit the help desk.
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
                        "Event Staff"}
                    </strong>
                  </p>
                  <p className="text-[11px] text-amber-400 font-semibold mt-1">
                    ✓ Duplicate entry is strictly blocked for security.
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
                      Ready for physical check-in
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 uppercase tracking-wider">
                  VALID ENTRY
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

                {/* Check-in Action Section */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  {!data.checkedIn && !alreadyCheckedInBanner ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Checking Staff Identifier (Optional)
                        </label>
                        <Input
                          placeholder="e.g. Gate 1 Desk / Reception"
                          value={staffName}
                          onChange={(e) => setStaffName(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-11 rounded-xl"
                        />
                      </div>

                      <Button
                        onClick={handleCheckIn}
                        disabled={checkingIn}
                        className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-base font-black tracking-wide shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
                      >
                        {checkingIn ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Recording Check-in...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-5 h-5" />
                            <span>MARK AS CHECKED IN</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-800/60 text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                        <Check className="w-3.5 h-3.5" /> Checked In
                      </div>
                      <p className="text-xs text-slate-300 font-medium pt-1">
                        Recorded for entry at {data.eventTitle}
                      </p>
                    </div>
                  )}
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
          Together for Sustainable Future · Event Operations Desk
        </p>
      </footer>
    </div>
  );
}
