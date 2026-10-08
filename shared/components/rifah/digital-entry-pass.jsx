"use client";

import React, { useState } from "react";
import {
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  User,
  Ticket,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { downloadTicketPdf } from "@shared/lib/ticket-pdf-generator";
import { toast } from "sonner";

export function DigitalEntryPass({
  ticketId,
  verificationToken,
  attendeeName = "Valued Member",
  attendeeEmail = "",
  attendeeCompany = "",
  eventTitle = "RIFAH Annual Summit",
  eventDate = "",
  eventTime = "",
  eventVenue = "Main Conference Center",
  eventCity = "",
  ticketType = "Member Pass",
  paymentStatus = "PAID",
  amountPaid = 0,
  onClose,
  className = "",
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const tokenParam = verificationToken ? `?token=${verificationToken}` : "";
  const verificationUrl = `${origin}/verify/ticket/${ticketId || "PASS"}${tokenParam}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    verificationUrl
  )}&margin=10`;

  const ticketData = {
    ticketId,
    attendeeName,
    attendeeEmail,
    attendeeCompany,
    eventTitle,
    eventDate,
    eventTime,
    eventVenue,
    eventCity,
    ticketType,
    paymentStatus,
    amountPaid,
    verificationUrl,
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadTicketPdf(ticketData);
      toast.success("Ticket PDF downloaded successfully!");
    } catch (err) {
      toast.error("Could not download ticket PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      toast.success("Verification link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* Ticket Container */}
      <div className="bg-[#0B1522] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative text-white">
        {/* Decorative Notches for Ticket Stub look */}
        <div className="absolute top-[215px] -left-3.5 w-7 h-7 rounded-full bg-slate-950 border border-slate-800 z-10"></div>
        <div className="absolute top-[215px] -right-3.5 w-7 h-7 rounded-full bg-slate-950 border border-slate-800 z-10"></div>

        {/* Top Header */}
        <div className="bg-gradient-to-br from-[#0F1E30] to-[#08121D] p-5 text-center border-b border-dashed border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 uppercase tracking-widest mb-1.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              RIFAH ENTRY PASS
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {ticketId}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-2xl w-44 h-44 mx-auto my-3 flex items-center justify-center shadow-lg border-2 border-sky-400/30">
            <img
              src={qrImageUrl}
              alt="Digital Entry Pass QR"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Present at entrance check-in desk
          </p>
        </div>

        {/* Pass Details Body */}
        <div className="p-5 space-y-4">
          {/* Attendee & Event */}
          <div className="space-y-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                ATTENDEE
              </span>
              <p className="text-base font-extrabold text-white leading-tight">
                {attendeeName}
              </p>
              {attendeeCompany && (
                <p className="text-xs text-sky-400 font-medium">
                  {attendeeCompany}
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                EVENT
              </span>
              <p className="text-sm font-bold text-slate-200 leading-snug">
                {eventTitle}
              </p>
            </div>
          </div>

          {/* Secondary Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {attendeeEmail && (
              <div className="col-span-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  EMAIL
                </span>
                <span className="font-semibold text-slate-200 truncate block">
                  {attendeeEmail}
                </span>
              </div>
            )}

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Ticket ID
              </span>
              <span className="font-mono font-bold text-sky-400 text-[11px] truncate block">
                {ticketId}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Ticket Type
              </span>
              <span className="font-bold text-white text-[11px] truncate block">
                {ticketType}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Registration
              </span>
              <span className="font-bold text-sky-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-sky-400" /> CONFIRMED
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Payment
              </span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {paymentStatus}
              </span>
            </div>

            {eventDate && (
              <div className="col-span-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Event Date & Time
                  </span>
                  <span className="font-semibold text-slate-200 text-[11px]">
                    {eventDate} {eventTime ? `• ${eventTime}` : ""}
                  </span>
                </div>
              </div>
            )}

            {eventVenue && (
              <div className="col-span-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Venue
                  </span>
                  <span className="font-semibold text-slate-200 text-[11px]">
                    {eventVenue} {eventCity ? `, ${eventCity}` : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Preparing PDF..." : "Download Ticket PDF"}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex-1 h-10 rounded-xl border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                    Copy Pass URL
                  </>
                )}
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex-1 h-10 rounded-xl border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <a href={verificationUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                  Staff View
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-[10px] text-slate-500">
          RIFAH Chamber of Commerce & Industry · Together for Sustainable Future
        </div>
      </div>
    </div>
  );
}

export default DigitalEntryPass;
