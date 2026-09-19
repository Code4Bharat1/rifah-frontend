"use client";
import { useState } from "react";
import Link from "next/link";
import { Cake, Sparkles, Check, Loader2, Building2, MapPin, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { messageApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { toast } from "sonner";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.536 1.838.82 2.796.821 3.183 0 5.769-2.587 5.769-5.768.001-3.181-2.585-5.765-5.769-5.765zm0-2c4.28 0 7.769 3.488 7.769 7.768 0 4.28-3.489 7.768-7.769 7.768-.002 0-.005 0-.007 0-1.287 0-2.459-.344-3.484-.949l-4.54 1.192 1.213-4.434c-.664-1.077-1.04-2.316-1.04-3.577 0-4.28 3.489-7.768 7.769-7.768zm3.626 10.985c-.156.438-.806.829-1.291.884-.33.037-.761.06-2.222-.544-1.868-.772-3.078-2.678-3.171-2.802-.094-.124-.757-1.008-.757-1.923 0-.915.48-1.365.65-1.551.171-.186.374-.233.498-.233.125 0 .25.002.358.008.114.005.267-.043.418.32.156.373.532 1.298.578 1.392.047.094.078.203.016.327-.063.125-.094.203-.187.312-.094.11-.198.246-.282.33-.094.093-.192.195-.083.382.11.187.487.804 1.045 1.302.72.64 1.326.838 1.513.931.187.093.296.078.406-.047.11-.125.468-.546.593-.733.124-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.358.219.047.078.047.453-.109.891z" />
    </svg>
  );
}

const AVATAR_THEMES = [
  "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
  "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
  "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
];

function getInitials(name) {
  if (!name) return "MB";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function BirthdayDialog({ open, onOpenChange, birthdays = [] }) {
  const { user } = useAuth();
  const [sendingMap, setSendingMap] = useState({});
  const [sentMap, setSentMap] = useState({});

  const myName = user?.name || "Fellow Member";
  const myChapter = user?.chapter ? ` (${user.chapter} Chapter)` : "";

  const handleSendWish = async (item) => {
    if (!item.userId) return;

    const messageContent = `Wishing you a very Happy Birthday! 🎂🎉 May this year bring immense success, happiness, and prosperous growth to you and ${item.businessName || "your business"}. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`;

    setSendingMap((prev) => ({ ...prev, [item.userId]: true }));
    try {
      await messageApi.sendMessage({
        recipientId: item.userId,
        text: messageContent,
      });
      setSentMap((prev) => ({ ...prev, [item.userId]: true }));
      toast.success(`Birthday wishes sent to ${item.userName}!`);
    } catch (err) {
      toast.error(err.message || "Failed to send birthday wish");
    } finally {
      setSendingMap((prev) => ({ ...prev, [item.userId]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[780px] max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-[28px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl font-sans">
        
        {/* TOP CELEBRATION HEADER WITH GRADIENT BANNER */}
        <div className="relative m-3.5 mb-0 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100/90 via-orange-100/80 to-amber-100/90 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-amber-950/40 border border-amber-200/50 dark:border-amber-900/30 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white shadow-lg flex items-center justify-center">
                <Cake className="h-7 w-7" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Today's Chapter Birthdays <span className="text-amber-500 font-normal">🎂</span>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  <strong className="text-slate-900 dark:text-white font-bold">{birthdays.length} {birthdays.length === 1 ? "member is" : "members are"}</strong> celebrating their birthday today!
                  <br className="hidden sm:inline" /> Connect and send your warm wishes.
                </DialogDescription>
              </div>
            </div>

            {/* Right: Tagline Pill Box */}
            <div className="hidden md:flex flex-col justify-center px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-2xs shrink-0 text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Celebrating Milestones.
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Growing Together.
              </span>
            </div>

          </div>
        </div>

        {/* MEMBERS SCROLLABLE LIST */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 space-y-3">
          {birthdays.map((item, idx) => {
            const isSending = sendingMap[item.userId];
            const isSent = sentMap[item.userId];
            const defaultMsg = `Wishing you a very Happy Birthday! 🎉 May this year bring immense success and prosperous growth to you and ${item.businessName || "your business"}. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`;
            const cleanWhatsapp = (item.whatsapp || item.phone || "").replace(/[^0-9]/g, "");
            const whatsappUrl = cleanWhatsapp
              ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(defaultMsg)}`
              : null;
            const themeClass = AVATAR_THEMES[idx % AVATAR_THEMES.length];
            const initials = getInitials(item.userName || item.businessName);

            return (
              <div
                key={String(item.userId || item.businessId || idx)}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Avatar & Member Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className={`h-14 w-14 shrink-0 rounded-2xl border flex items-center justify-center font-extrabold text-lg shadow-2xs ${themeClass}`}>
                      {item.userAvatar ? (
                        <img
                          src={item.userAvatar}
                          alt={item.userName}
                          className="h-full w-full object-cover rounded-2xl"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Name & Birthday Pill */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                          {item.userName}
                        </h4>
                        {item.isSelf ? (
                          <span className="text-[11px] bg-amber-500 text-white font-bold px-2.5 py-0.5 rounded-full">
                            You!
                          </span>
                        ) : (
                          <span className="text-[11px] bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800">
                            Birthday Today 🎂
                          </span>
                        )}
                      </div>

                      {/* Details Row */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {item.businessName && (
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            {item.businessName}
                          </span>
                        )}
                        {item.chapter && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {item.chapter} Chapter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (WhatsApp & Say Happy Birthday) */}
                  {!item.isSelf && (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end lg:self-center">
                      {whatsappUrl && (
                        <Button
                          asChild
                          size="sm"
                          className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="h-4 w-4" />
                            <span>WhatsApp</span>
                          </a>
                        </Button>
                      )}

                      {isSent ? (
                        <Button
                          size="sm"
                          disabled
                          className="h-9 px-4 text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-bold rounded-full gap-1.5 border border-amber-300 dark:border-amber-800"
                        >
                          <Check className="h-4 w-4 text-amber-600" />
                          <span>Wished</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isSending}
                          onClick={() => handleSendWish(item)}
                          className="h-9 px-4 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>🎂</span>}
                          <span>Say Happy Birthday</span>
                        </Button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM FOOTER */}
        <div className="px-5 py-3.5 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {birthdays.length} {birthdays.length === 1 ? "birthday" : "birthdays"} today
            </span>
            <p className="text-[11px] text-muted-foreground">
              Celebrating together across RIFAH Chamber chapters.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-bold rounded-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs gap-1.5"
          >
            <Link href="/biz/networking">
              <span>View All Members</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default BirthdayDialog;
