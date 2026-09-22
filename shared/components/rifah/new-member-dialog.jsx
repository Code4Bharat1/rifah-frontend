"use client";
import { useState } from "react";
import Link from "next/link";
import { Users, Calendar, Building2, User, MapPin, Check, Loader2, ArrowRight, Sparkles } from "lucide-react";
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
  "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
  "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
  "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
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

function formatJoinedTime(dateStr) {
  if (!dateStr) return "Joined recently";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Joined just now";
    if (hours < 24) return `Joined ${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `Joined ${days} day${days > 1 ? "s" : ""} ago`;
  } catch {
    return "Joined recently";
  }
}

export function NewMemberDialog({ open, onOpenChange, newMembers = [] }) {
  const { user } = useAuth();
  const [sendingMap, setSendingMap] = useState({});
  const [sentMap, setSentMap] = useState({});

  const myName = user?.name || "Fellow Member";
  const myChapter = user?.chapter ? ` (${user.chapter} Chapter)` : "";

  const handleSendWelcome = async (item) => {
    if (!item.userId) return;

    const messageContent = `Hi ${item.userName || "there"}, Chamber! 🎉 Delighted to have ${item.businessName} in our chapter. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`;

    setSendingMap((prev) => ({ ...prev, [item.userId]: true }));
    try {
      await messageApi.sendMessage({
        recipientId: item.userId,
        text: messageContent,
      });
      setSentMap((prev) => ({ ...prev, [item.userId]: true }));
      toast.success(`Welcome message sent to ${item.businessName}!`);
    } catch (err) {
      toast.error(err.message || "Failed to send welcome message");
    } finally {
      setSendingMap((prev) => ({ ...prev, [item.userId]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-[780px] max-h-[88vh] flex flex-col p-0 sm:p-0 gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl font-sans">

        {/* TOP CELEBRATION HEADER WITH SEAMLESS GRADIENT BANNER */}
        <div className="relative border-b border-indigo-100/90 dark:border-indigo-900/50 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 px-6 py-5 pr-14 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-100/90 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                  <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  Chapter Community
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                New Chapter Members
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Welcoming <strong className="font-bold text-slate-900 dark:text-slate-200">{newMembers.length} {newMembers.length === 1 ? "business" : "businesses"}</strong> who joined your chapter recently.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* MEMBERS SCROLLABLE LIST */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[58vh] space-y-3.5 bg-slate-50/40 dark:bg-slate-950/40">
          {newMembers.map((item, idx) => {
            const isSending = sendingMap[item.userId];
            const isSent = sentMap[item.userId];
            const cleanWhatsapp = (item.whatsapp || item.phone || "").replace(/[^0-9]/g, "");
            const whatsappDefault = `Hi ${item.userName || "there"}, Chamber! 🎉 Delighted to have ${item.businessName} in our chapter. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`;
            const whatsappUrl = cleanWhatsapp
              ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappDefault)}`
              : null;
            const themeClass = AVATAR_THEMES[idx % AVATAR_THEMES.length];
            const initials = getInitials(item.businessName || item.userName);

            return (
              <div
                key={String(item.businessId || item.userId || idx)}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">

                  {/* Left: Avatar Block */}
                  <div className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl border flex items-center justify-center font-extrabold text-base sm:text-lg shadow-xs ${themeClass}`}>
                    {item.userAvatar ? (
                      <img
                        src={item.userAvatar}
                        alt={item.businessName}
                        className="h-full w-full object-cover rounded-2xl"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Right: Business Details & Actions */}
                  <div className="min-w-0 flex-1 flex flex-col justify-between gap-2.5">

                    {/* Top Row: Business Name in single clean line */}
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                        {item.businessName}
                      </h4>
                    </div>

                    {/* Bottom Row: Owner, Category, Chapter, Joined on Left; Pill & Buttons on Right */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60">

                      {/* Left: Details Row */}
                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Owner: <strong className="font-semibold text-slate-800 dark:text-slate-200">{item.userName}</strong></span>
                        </span>
                        {item.industry && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.industry}</span>
                          </span>
                        )}
                        {item.chapter && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{item.chapter} Chapter</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{formatJoinedTime(item.joinedAt)}</span>
                        </span>
                      </div>

                      {/* Right (Niche Right Me): New Member Pill + WhatsApp + Say Welcome */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="inline-flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 font-semibold px-3 py-1.5 rounded-xl border border-sky-200/80 dark:border-sky-800 shrink-0">
                          <Sparkles className="h-3.5 w-3.5 text-sky-500 fill-sky-400 shrink-0" />
                          <span>New Member</span>
                        </span>

                        {whatsappUrl && (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8.5 px-3.5 text-xs font-semibold rounded-xl border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                              <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          </Button>
                        )}

                        {isSent ? (
                          <Button
                            size="sm"
                            disabled
                            className="h-8.5 px-3.5 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold rounded-xl gap-1.5 border border-emerald-300 dark:border-emerald-800"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Welcomed</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={isSending}
                            onClick={() => handleSendWelcome(item)}
                            className="h-8.5 px-3.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            {isSending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 text-sky-200 fill-sky-200" />
                            )}
                            <span>Say Welcome</span>
                          </Button>
                        )}
                      </div>

                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM FOOTER */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Build stronger connections. A stronger RIFAH community.
            </span>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8.5 px-3.5 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-2xs gap-1.5 self-end sm:self-center"
          >
            <Link href="/biz/networking">
              <span>Chapter Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default NewMemberDialog;
