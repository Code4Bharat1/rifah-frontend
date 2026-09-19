"use client";
import { useState } from "react";
import { CalendarDays, Check, Copy, Mail, MapPin, Share2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { eventImage } from "@shared/lib/media";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { cn } from "@shared/lib/utils";

export function EventShareModal({ event, open, onOpenChange }) {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const getEventShareUrl = () => {
    const liveDomain = process.env.NEXT_PUBLIC_APP_URL || "http://rifah.nexcorealliance.com";
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return `${origin}/events/${event.slug || event._id}`;
      }
    }
    return `${liveDomain}/events/${event.slug || event._id}`;
  };

  const shareUrl = getEventShareUrl();
  const eventTitle = event.title || "RIFAH Chamber Event";
  const eventDate = event.date || "Upcoming";
  const eventTime = event.time || "";
  const eventVenue = `${event.venue || ""}${event.city ? `, ${event.city}` : ""}`.trim() || event.chapter || "RIFAH Chamber";

  const inviteMessage = `🤝 *RIFAH Chamber Event Invitation*\n\n📌 *${eventTitle}*\n📅 Date: ${eventDate}${eventTime ? ` · ${eventTime}` : ""}\n📍 Location: ${eventVenue}\n\nJoin us and reserve your pass here:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Event link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Join us for "${eventTitle}" on ${eventDate} at ${eventVenue}:`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] sm:max-w-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface border border-border shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Share2 className="h-4 w-4" />
            </div>
            <span>Share Event</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Invite members, business partners, or colleagues to this chamber meet.
          </DialogDescription>
        </DialogHeader>

        {/* Event Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border mt-1">
          <img
            src={event.coverImage ? resolveMediaUrl(event.coverImage) : eventImage}
            alt={eventTitle}
            onError={(e) => {
              e.currentTarget.src = eventImage;
            }}
            className="h-14 w-14 rounded-xl object-cover border border-border shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs sm:text-sm truncate text-foreground leading-snug">
              {eventTitle}
            </h4>
            <p className="text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5 truncate">
              <CalendarDays className="h-3 w-3 shrink-0" /> {eventDate} {eventTime && `· ${eventTime}`}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="h-3 w-3 shrink-0" /> {eventVenue}
            </p>
          </div>
        </div>

        {/* Direct Social Channels */}
        <div className="mt-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Share directly via
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-[11px] font-medium text-foreground">WhatsApp</span>
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/5 transition group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28M7.86 18.5V10.1H5.06v8.4h2.8Z"/>
                </svg>
              </div>
              <span className="text-[11px] font-medium text-foreground">LinkedIn</span>
            </a>

            {/* Twitter / X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join this RIFAH event: "${eventTitle}" on ${eventDate}`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border hover:border-foreground/30 hover:bg-muted/40 transition group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-foreground">X (Twitter)</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`RIFAH Event: ${eventTitle} (${eventDate})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border hover:border-[#229ED9]/50 hover:bg-[#229ED9]/5 transition group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#229ED9] flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <span className="text-[11px] font-medium text-foreground">Telegram</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(`RIFAH Event Invitation: ${eventTitle}`)}&body=${encodeURIComponent(inviteMessage)}`}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-700 dark:bg-slate-800 text-white flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-foreground">Email</span>
            </a>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="mt-2 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Direct Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-muted/40 text-foreground font-mono select-all outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCopyLink}
              className={cn(
                "rounded-xl gap-1.5 text-xs font-semibold shrink-0 transition-all",
                copied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Native Mobile Share Sheet */}
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <div className="mt-1 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs font-medium rounded-xl"
              onClick={handleNativeShare}
            >
              <Smartphone className="h-3.5 w-3.5" /> Share via phone apps...
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
export default EventShareModal;
