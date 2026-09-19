"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Cake, Megaphone, Users, X, Sparkles, Award } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { useTodayBirthdays, useTodayAnniversaries, useNewChapterMembers } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";
import { BirthdayDialog } from "./birthday-dialog";
import { AnniversaryDialog } from "./anniversary-dialog";
import { NewMemberDialog } from "./new-member-dialog";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={cn("fill-current", className)} viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.536 1.838.82 2.796.821 3.183 0 5.769-2.587 5.769-5.768.001-3.181-2.585-5.765-5.769-5.765zm0-2c4.28 0 7.769 3.488 7.769 7.768 0 4.28-3.489 7.768-7.769 7.768-.002 0-.005 0-.007 0-1.287 0-2.459-.344-3.484-.949l-4.54 1.192 1.213-4.434c-.664-1.077-1.04-2.316-1.04-3.577 0-4.28 3.489-7.768 7.769-7.768zm3.626 10.985c-.156.438-.806.829-1.291.884-.33.037-.761.06-2.222-.544-1.868-.772-3.078-2.678-3.171-2.802-.094-.124-.757-1.008-.757-1.923 0-.915.48-1.365.65-1.551.171-.186.374-.233.498-.233.125 0 .25.002.358.008.114.005.267-.043.418.32.156.373.532 1.298.578 1.392.047.094.078.203.016.327-.063.125-.094.203-.187.312-.094.11-.198.246-.282.33-.094.093-.192.195-.083.382.11.187.487.804 1.045 1.302.72.64 1.326.838 1.513.931.187.093.296.078.406-.047.11-.125.468-.546.593-.733.124-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.358.219.047.078.047.453-.109.891z" />
    </svg>
  );
}

export function BirthdayBanner() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: birthdayData } = useTodayBirthdays({ enabled: !!user });
  const { data: anniversaryData } = useTodayAnniversaries({ enabled: !!user });
  const { data: newMembersData } = useNewChapterMembers({ enabled: !!user });

  const [isBirthdayDismissed, setIsBirthdayDismissed] = useState(false);
  const [isAnniversaryDismissed, setIsAnniversaryDismissed] = useState(false);
  const [isNewMembersDismissed, setIsNewMembersDismissed] = useState(false);

  const [isBirthdayDialogOpen, setIsBirthdayDialogOpen] = useState(false);
  const [isAnniversaryDialogOpen, setIsAnniversaryDialogOpen] = useState(false);
  const [isNewMembersDialogOpen, setIsNewMembersDialogOpen] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (sessionStorage.getItem("rifah_birthday_banner_dismissed") === todayStr) {
      setIsBirthdayDismissed(true);
    }
    if (sessionStorage.getItem("rifah_anniversary_banner_dismissed") === todayStr) {
      setIsAnniversaryDismissed(true);
    }
    if (sessionStorage.getItem("rifah_new_members_banner_dismissed") === todayStr) {
      setIsNewMembersDismissed(true);
    }
  }, []);

  // Restrict to dashboard main pages only
  const cleanPath = (pathname || "").replace(/\/$/, "");
  const dashboardRoutes = [
    "/biz",
    "/chapter-admin",
  ];
  const isDashboard = dashboardRoutes.includes(cleanPath);

  // Exclude Admin & Super Admin from celebration/welcome banners
  const allowedRoles = ["chapter_admin", "business", "business_owner"];
  if (!isDashboard || !user || !allowedRoles.includes(user.role)) return null;

  const myName = user?.name || "Member";
  const myChapter = user?.chapter ? ` (${user.chapter} Chapter)` : "";

  // 1. Birthday Data
  const isSelfBirthday = !isBirthdayDismissed && !!birthdayData?.isSelfBirthday;
  const selfBirthdayName = birthdayData?.selfName || user?.name || "Member";
  const otherBirthdays = !isBirthdayDismissed ? (birthdayData?.todayBirthdays || []).filter((b) => !b.isSelf) : [];

  // 2. Anniversary Data
  const isSelfAnniversary = !isAnniversaryDismissed && !!anniversaryData?.isSelfAnniversary;
  const selfAnnivBizName = anniversaryData?.selfBusinessName || user?.organization || user?.name || "Your Business";
  const selfYearsCompleted = anniversaryData?.selfYearsCompleted || 1;
  const otherAnniversaries = !isAnniversaryDismissed ? (anniversaryData?.todayAnniversaries || []).filter((a) => !a.isSelf) : [];

  // 3. New Chapter Members Data (exclude current user)
  const rawNewMembers = newMembersData?.newMembers || [];
  const otherNewMembers = !isNewMembersDismissed
    ? rawNewMembers.filter((m) => String(m.userId) !== String(user?._id || user?.id))
    : [];

  const hasAnyBirthday = isSelfBirthday || otherBirthdays.length > 0;
  const hasAnyAnniversary = isSelfAnniversary || otherAnniversaries.length > 0;
  const hasAnyNewMembers = otherNewMembers.length > 0;

  if (!hasAnyBirthday && !hasAnyAnniversary && !hasAnyNewMembers) return null;

  const handleDismissBirthday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    sessionStorage.setItem("rifah_birthday_banner_dismissed", todayStr);
    setIsBirthdayDismissed(true);
  };

  const handleDismissAnniversary = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    sessionStorage.setItem("rifah_anniversary_banner_dismissed", todayStr);
    setIsAnniversaryDismissed(true);
  };

  const handleDismissNewMembers = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    sessionStorage.setItem("rifah_new_members_banner_dismissed", todayStr);
    setIsNewMembersDismissed(true);
  };

  const getOrdinal = (n) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);

  return (
    <>
      <div className="w-full space-y-3 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
        
        {/* ========================================================================= */}
        {/* 1. SELF BIRTHDAY CELEBRATION BANNER (Top Banner)                          */}
        {/* ========================================================================= */}
        {isSelfBirthday && (
          <div className="relative overflow-hidden rounded-3xl border border-sky-200/90 bg-sky-50/75 dark:bg-sky-950/30 dark:border-sky-800/80 p-4 sm:px-6 sm:py-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 shadow-2xs">
                  <Cake className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    Happy Birthday, {selfBirthdayName}! 🎉
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-0.5 leading-relaxed">
                    RIFAH Chamber of Commerce wishes you continued success, good health and many more milestones ahead.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-sky-200/80 dark:border-sky-800/60">
                <div className="hidden md:block w-px h-10 bg-sky-200 dark:bg-sky-800 shrink-0" />

                <div className="text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm leading-snug text-left">
                  “Stronger Businesses.
                  <br />
                  A Brighter Tomorrow.”
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissBirthday}
                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-sky-100 dark:text-blue-400 dark:hover:bg-sky-900/50 rounded-full shrink-0 ml-2"
                  title="Dismiss greeting"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SELF MEMBERSHIP ANNIVERSARY BANNER                                     */}
        {/* ========================================================================= */}
        {isSelfAnniversary && (
          <div className="relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-emerald-50/75 dark:bg-emerald-950/30 dark:border-emerald-800/80 p-4 sm:px-6 sm:py-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 shadow-2xs">
                  <Award className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    Happy {getOrdinal(selfYearsCompleted)} Anniversary with RIFAH, {selfAnnivBizName}! 🌟
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-0.5 leading-relaxed">
                    Celebrating {selfYearsCompleted} year{selfYearsCompleted > 1 ? "s" : ""} of partnership, trust, and business excellence with RIFAH Chamber of Commerce & Industry.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-emerald-200/80 dark:border-emerald-800/60">
                <div className="hidden md:block w-px h-10 bg-emerald-200 dark:bg-emerald-800 shrink-0" />

                <div className="text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm leading-snug text-left">
                  “Growing Stronger.
                  <br />
                  Together in Business.”
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissAnniversary}
                  className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-full shrink-0 ml-2"
                  title="Dismiss greeting"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CHAPTER MEMBER BIRTHDAY ALERT (Middle Banner)                          */}
        {/* ========================================================================= */}
        {otherBirthdays.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/60 p-3 sm:px-4 sm:py-3 shadow-2xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400">
                  <Megaphone className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  {otherBirthdays.length === 1 ? (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal truncate">
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {otherBirthdays[0].userName} ({otherBirthdays[0].businessName})
                      </strong>{" "}
                      is celebrating their birthday today! 🥳
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal truncate">
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {otherBirthdays.map((b) => b.userName).slice(0, 2).join(", ")}
                        {otherBirthdays.length > 2 ? ` +${otherBirthdays.length - 2} more` : ""}
                      </strong>{" "}
                      celebrating their birthday today in chapter! 🎂
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {otherBirthdays.length === 1 && (otherBirthdays[0].whatsapp || otherBirthdays[0].phone) && (
                  <a
                    href={`https://wa.me/${(otherBirthdays[0].whatsapp || otherBirthdays[0].phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Wishing you a very Happy Birthday! 🎉 May this year bring immense success to you and ${otherBirthdays[0].businessName || "your business"}. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <Button
                  size="sm"
                  onClick={() => setIsBirthdayDialogOpen(true)}
                  className="h-8 px-3.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl gap-1.5 shadow-xs transition-colors"
                >
                  <Cake className="h-3.5 w-3.5" />
                  <span>{otherBirthdays.length === 1 ? "Wish Member" : `View All (${otherBirthdays.length})`}</span>
                </Button>

                {!isSelfBirthday && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissBirthday}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full shrink-0"
                    title="Dismiss banner"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CHAPTER MEMBER ANNIVERSARY ALERT                                       */}
        {/* ========================================================================= */}
        {otherAnniversaries.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/60 p-3 sm:px-4 sm:py-3 shadow-2xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400">
                  <Award className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  {otherAnniversaries.length === 1 ? (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal truncate">
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {otherAnniversaries[0].businessName}
                      </strong>{" "}
                      is celebrating their {getOrdinal(otherAnniversaries[0].yearsCompleted)} RIFAH Anniversary today! 🌟
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal truncate">
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {otherAnniversaries.length} Chapter Businesses
                      </strong>{" "}
                      celebrating RIFAH membership anniversary today! 🌟
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {otherAnniversaries.length === 1 && (otherAnniversaries[0].whatsapp || otherAnniversaries[0].phone) && (
                  <a
                    href={`https://wa.me/${(otherAnniversaries[0].whatsapp || otherAnniversaries[0].phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Congratulations on your ${getOrdinal(otherAnniversaries[0].yearsCompleted)} Anniversary with RIFAH Chamber! 🎊 Wishing continued growth to ${otherAnniversaries[0].businessName}. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <Button
                  size="sm"
                  onClick={() => setIsAnniversaryDialogOpen(true)}
                  className="h-8 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-1.5 shadow-xs transition-colors"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>{otherAnniversaries.length === 1 ? "Congratulate" : `View All (${otherAnniversaries.length})`}</span>
                </Button>

                {!isSelfAnniversary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissAnniversary}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full shrink-0"
                    title="Dismiss banner"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. NEW CHAPTER MEMBER WELCOME ALERT (Bottom Banner)                       */}
        {/* ========================================================================= */}
        {otherNewMembers.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-800/60 p-3 sm:px-4 sm:py-3 shadow-2xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
                  <Users className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  {otherNewMembers.length === 1 ? (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal truncate">
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {otherNewMembers[0].businessName} ({otherNewMembers[0].userName})
                      </strong>{" "}
                      newly joined the chapter! Say hello & welcome them to RIFAH! 👏
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal truncate">
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {otherNewMembers.map((m) => m.businessName).slice(0, 2).join(", ")}
                        {otherNewMembers.length > 2 ? ` +${otherNewMembers.length - 2} more` : ""}
                      </strong>{" "}
                      newly joined your chapter! Say hello & welcome them to RIFAH! ✨
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {otherNewMembers.length === 1 && (otherNewMembers[0].whatsapp || otherNewMembers[0].phone) && (
                  <a
                    href={`https://wa.me/${(otherNewMembers[0].whatsapp || otherNewMembers[0].phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${otherNewMembers[0].userName}, welcome to the RIFAH Chamber! 🎉 We are excited to connect with ${otherNewMembers[0].businessName}. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <Button
                  size="sm"
                  onClick={() => setIsNewMembersDialogOpen(true)}
                  className="h-8 px-3.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>{otherNewMembers.length === 1 ? "Welcome Member" : `View & Welcome (${otherNewMembers.length})`}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissNewMembers}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full shrink-0"
                  title="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Birthday Dialog */}
      <BirthdayDialog
        open={isBirthdayDialogOpen}
        onOpenChange={setIsBirthdayDialogOpen}
        birthdays={otherBirthdays}
      />

      {/* Anniversary Dialog */}
      <AnniversaryDialog
        open={isAnniversaryDialogOpen}
        onOpenChange={setIsAnniversaryDialogOpen}
        anniversaries={otherAnniversaries}
      />

      {/* New Member Dialog */}
      <NewMemberDialog
        open={isNewMembersDialogOpen}
        onOpenChange={setIsNewMembersDialogOpen}
        newMembers={otherNewMembers}
      />
    </>
  );
}

export default BirthdayBanner;
