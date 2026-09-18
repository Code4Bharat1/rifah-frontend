"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Users, Sparkles, Award } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { useTodayBirthdays, useTodayAnniversaries, useNewChapterMembers } from "@shared/hooks/use-rifah-api";
import { useAuth } from "@shared/providers/auth-provider";
import { BirthdayDialog } from "./birthday-dialog";
import { AnniversaryDialog } from "./anniversary-dialog";
import { NewMemberDialog } from "./new-member-dialog";

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

  // Restrict to dashboard main pages only (NOT subpages like /biz/profile, /biz/enquiries, etc.)
  const cleanPath = (pathname || "").replace(/\/$/, "");
  const dashboardRoutes = [
    "/biz",
    "/chapter-admin",
    "/admin",
    "/state-admin",
    "/secretariat",
    "/consumer",
  ];
  const isDashboard = dashboardRoutes.includes(cleanPath);

  if (!isDashboard || !user) return null;

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
        {/* 1. SELF BIRTHDAY CELEBRATION BANNER                                       */}
        {/* ========================================================================= */}
        {isSelfBirthday && (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-100/95 via-sky-50/90 to-blue-100/80 dark:from-blue-950/60 dark:via-sky-950/40 dark:to-blue-900/50 border border-blue-200/90 dark:border-blue-800/70 px-4 py-3.5 sm:px-6 sm:py-4 shadow-xs">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                <div className="text-2xl sm:text-3xl shrink-0 mt-0.5 sm:mt-0 select-none">
                  🎉
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    Happy Birthday, {selfBirthdayName}! 🎉
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-950/80 dark:text-blue-200/80 font-normal mt-0.5 leading-relaxed">
                    RIFAH Chamber of Commerce wishes you continued success, good health and many more milestones ahead.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-blue-200/70 dark:border-blue-800/50">
                <div className="hidden md:block w-px h-10 bg-blue-300/80 dark:bg-blue-700/80 mx-1 shrink-0" />

                <div className="text-blue-800 dark:text-blue-300 font-bold italic text-xs sm:text-sm md:text-sm tracking-tight leading-snug text-left">
                  <span className="text-blue-400 dark:text-blue-400 font-serif text-base mr-1">“</span>
                  Stronger Businesses.
                  <br className="hidden sm:inline" />{" "}
                  A Brighter Tomorrow.
                  <span className="text-blue-400 dark:text-blue-400 font-serif text-base ml-1">”</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissBirthday}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-200/50 dark:hover:bg-blue-900/50 rounded-full shrink-0 ml-auto md:ml-2"
                  title="Dismiss greeting"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SELF MEMBERSHIP ANNIVERSARY CELEBRATION BANNER                         */}
        {/* ========================================================================= */}
        {isSelfAnniversary && (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-100/95 via-teal-50/90 to-emerald-100/80 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-emerald-900/50 border border-emerald-200/90 dark:border-emerald-800/70 px-4 py-3.5 sm:px-6 sm:py-4 shadow-xs">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                <div className="text-2xl sm:text-3xl shrink-0 mt-0.5 sm:mt-0 select-none">
                  🎊
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    Happy {getOrdinal(selfYearsCompleted)} Anniversary with RIFAH, {selfAnnivBizName}! 🌟
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-950/80 dark:text-emerald-200/80 font-normal mt-0.5 leading-relaxed">
                    Celebrating {selfYearsCompleted} year{selfYearsCompleted > 1 ? "s" : ""} of partnership, trust, and business excellence with RIFAH Chamber of Commerce & Industry.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-emerald-200/70 dark:border-emerald-800/50">
                <div className="hidden md:block w-px h-10 bg-emerald-300/80 dark:bg-emerald-700/80 mx-1 shrink-0" />

                <div className="text-emerald-900 dark:text-emerald-200 font-bold italic text-xs sm:text-sm md:text-sm tracking-tight leading-snug text-left">
                  <span className="text-emerald-500 font-serif text-base mr-1">“</span>
                  Growing Stronger.
                  <br className="hidden sm:inline" />{" "}
                  Together in Business.
                  <span className="text-emerald-500 font-serif text-base ml-1">”</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissAnniversary}
                  className="h-8 w-8 p-0 text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 rounded-full shrink-0 ml-auto md:ml-2"
                  title="Dismiss greeting"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CHAPTER MEMBERS BIRTHDAY NEWSBAR                                       */}
        {/* ========================================================================= */}
        {otherBirthdays.length > 0 && (
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-sky-200/80 dark:border-sky-800/60 bg-gradient-to-r from-sky-50/90 via-blue-50/70 to-indigo-50/80 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-indigo-950/20 p-3 sm:p-3.5 shadow-xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-base select-none">
                  🎉
                </span>

                <div className="min-w-0 flex-1">
                  {otherBirthdays.length === 1 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-bold text-blue-900 dark:text-blue-300">
                        {otherBirthdays[0].userName}
                      </span>{" "}
                      ({otherBirthdays[0].businessName}) is celebrating their birthday today! 🎂
                    </p>
                  )}

                  {otherBirthdays.length > 1 && otherBirthdays.length <= 3 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-bold text-blue-800 dark:text-blue-300">Chapter Birthdays Today:</span>{" "}
                      {otherBirthdays.map((b, idx) => (
                        <span key={b.userId || idx}>
                          <strong className="text-slate-900 dark:text-white font-bold">{b.userName}</strong>{" "}
                          <span className="text-muted-foreground text-xs">({b.businessName})</span>
                          {idx < otherBirthdays.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {" "}🎂
                    </p>
                  )}

                  {otherBirthdays.length > 3 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-extrabold text-blue-800 dark:text-blue-300">
                        🎂 {otherBirthdays.length} Chapter Members
                      </span>{" "}
                      celebrating their birthday today:{" "}
                      <span className="font-bold text-slate-900 dark:text-white">{otherBirthdays[0].userName}</span> ({otherBirthdays[0].businessName}),{" "}
                      <span className="font-bold text-slate-900 dark:text-white">{otherBirthdays[1].userName}</span> ({otherBirthdays[1].businessName}){" "}
                      <span className="text-xs font-semibold text-primary">+{otherBirthdays.length - 2} more...</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {otherBirthdays.length === 1 ? (
                  <>
                    {otherBirthdays[0].whatsapp ? (
                      <Button
                        asChild
                        size="sm"
                        className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg gap-1.5 shadow-xs"
                      >
                        <a
                          href={`https://wa.me/${(otherBirthdays[0].whatsapp || otherBirthdays[0].phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Wishing you a very Happy Birthday! 🎉 May this year bring immense success to you and ${otherBirthdays[0].businessName || "your business"}. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.536 1.838.82 2.796.821 3.183 0 5.769-2.587 5.769-5.768.001-3.181-2.585-5.765-5.769-5.765zm0-2c4.28 0 7.769 3.488 7.769 7.768 0 4.28-3.489 7.768-7.769 7.768-.002 0-.005 0-.007 0-1.287 0-2.459-.344-3.484-.949l-4.54 1.192 1.213-4.434c-.664-1.077-1.04-2.316-1.04-3.577 0-4.28 3.489-7.768 7.769-7.768zm3.626 10.985c-.156.438-.806.829-1.291.884-.33.037-.761.06-2.222-.544-1.868-.772-3.078-2.678-3.171-2.802-.094-.124-.757-1.008-.757-1.923 0-.915.48-1.365.65-1.551.171-.186.374-.233.498-.233.125 0 .25.002.358.008.114.005.267-.043.418.32.156.373.532 1.298.578 1.392.047.094.078.203.016.327-.063.125-.094.203-.187.312-.094.11-.198.246-.282.33-.094.093-.192.195-.083.382.11.187.487.804 1.045 1.302.72.64 1.326.838 1.513.931.187.093.296.078.406-.047.11-.125.468-.546.593-.733.124-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.358.219.047.078.047.453-.109.891z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      </Button>
                    ) : null}

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs font-semibold rounded-lg gap-1 border-blue-200 dark:border-blue-800"
                    >
                      <Link href={`/biz/messages?recipient=${otherBirthdays[0].userId}`}>
                        <MessageSquare className="h-3 w-3 text-primary" />
                        <span>Message</span>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsBirthdayDialogOpen(true)}
                    className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-white font-bold rounded-lg gap-1.5 shadow-xs"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>View All ({otherBirthdays.length})</span>
                  </Button>
                )}

                {!isSelfBirthday && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissBirthday}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-full"
                    title="Dismiss banner"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CHAPTER MEMBERS ANNIVERSARY NEWSBAR                                    */}
        {/* ========================================================================= */}
        {otherAnniversaries.length > 0 && (
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-blue-50/80 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/20 p-3 sm:p-3.5 shadow-xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-base select-none">
                  🎊
                </span>

                <div className="min-w-0 flex-1">
                  {otherAnniversaries.length === 1 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300">
                        {otherAnniversaries[0].businessName}
                      </span>{" "}
                      is celebrating their{" "}
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {getOrdinal(otherAnniversaries[0].yearsCompleted)} RIFAH Anniversary
                      </span>{" "}
                      today! 🌟
                    </p>
                  )}

                  {otherAnniversaries.length > 1 && otherAnniversaries.length <= 3 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">Chapter Anniversaries Today:</span>{" "}
                      {otherAnniversaries.map((a, idx) => (
                        <span key={a.businessId || idx}>
                          <strong className="text-slate-900 dark:text-white font-bold">{a.businessName}</strong>{" "}
                          <span className="text-muted-foreground text-xs">({getOrdinal(a.yearsCompleted)} yr)</span>
                          {idx < otherAnniversaries.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {" "}🌟
                    </p>
                  )}

                  {otherAnniversaries.length > 3 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                        🌟 {otherAnniversaries.length} Chapter Businesses
                      </span>{" "}
                      celebrating RIFAH membership anniversary today:{" "}
                      <span className="font-bold text-slate-900 dark:text-white">{otherAnniversaries[0].businessName}</span>,{" "}
                      <span className="font-bold text-slate-900 dark:text-white">{otherAnniversaries[1].businessName}</span>{" "}
                      <span className="text-xs font-semibold text-primary">+{otherAnniversaries.length - 2} more...</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {otherAnniversaries.length === 1 ? (
                  <>
                    {otherAnniversaries[0].whatsapp ? (
                      <Button
                        asChild
                        size="sm"
                        className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg gap-1.5 shadow-xs"
                      >
                        <a
                          href={`https://wa.me/${(otherAnniversaries[0].whatsapp || otherAnniversaries[0].phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Congratulations on your ${getOrdinal(otherAnniversaries[0].yearsCompleted)} Anniversary with RIFAH Chamber! 🎊 Wishing continued growth to ${otherAnniversaries[0].businessName}. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.536 1.838.82 2.796.821 3.183 0 5.769-2.587 5.769-5.768.001-3.181-2.585-5.765-5.769-5.765zm0-2c4.28 0 7.769 3.488 7.769 7.768 0 4.28-3.489 7.768-7.769 7.768-.002 0-.005 0-.007 0-1.287 0-2.459-.344-3.484-.949l-4.54 1.192 1.213-4.434c-.664-1.077-1.04-2.316-1.04-3.577 0-4.28 3.489-7.768 7.769-7.768zm3.626 10.985c-.156.438-.806.829-1.291.884-.33.037-.761.06-2.222-.544-1.868-.772-3.078-2.678-3.171-2.802-.094-.124-.757-1.008-.757-1.923 0-.915.48-1.365.65-1.551.171-.186.374-.233.498-.233.125 0 .25.002.358.008.114.005.267-.043.418.32.156.373.532 1.298.578 1.392.047.094.078.203.016.327-.063.125-.094.203-.187.312-.094.11-.198.246-.282.33-.094.093-.192.195-.083.382.11.187.487.804 1.045 1.302.72.64 1.326.838 1.513.931.187.093.296.078.406-.047.11-.125.468-.546.593-.733.124-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.358.219.047.078.047.453-.109.891z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      </Button>
                    ) : null}

                    {otherAnniversaries[0].userId && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs font-semibold rounded-lg gap-1 border-emerald-200 dark:border-emerald-800"
                      >
                        <Link href={`/biz/messages?recipient=${otherAnniversaries[0].userId}`}>
                          <MessageSquare className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Message</span>
                        </Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsAnniversaryDialogOpen(true)}
                    className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg gap-1.5 shadow-xs"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>View All ({otherAnniversaries.length})</span>
                  </Button>
                )}

                {!isSelfAnniversary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissAnniversary}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-full"
                    title="Dismiss banner"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. NEW CHAPTER MEMBERS WELCOME NEWSBAR                                    */}
        {/* ========================================================================= */}
        {otherNewMembers.length > 0 && (
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-purple-50/80 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-purple-950/20 p-3 sm:p-3.5 shadow-xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-base select-none">
                  👋
                </span>

                <div className="min-w-0 flex-1">
                  {otherNewMembers.length === 1 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-bold text-indigo-950 dark:text-indigo-300">
                        {otherNewMembers[0].businessName}
                      </span>{" "}
                      ({otherNewMembers[0].userName}) newly joined the chapter! Say hello & welcome them to RIFAH! 🎉
                    </p>
                  )}

                  {otherNewMembers.length > 1 && otherNewMembers.length <= 3 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300">New Members in Chapter:</span>{" "}
                      {otherNewMembers.map((m, idx) => (
                        <span key={m.businessId || idx}>
                          <strong className="text-slate-900 dark:text-white font-bold">{m.businessName}</strong>{" "}
                          <span className="text-muted-foreground text-xs">({m.userName})</span>
                          {idx < otherNewMembers.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {" "}🎉
                    </p>
                  )}

                  {otherNewMembers.length > 3 && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                      <span className="font-extrabold text-indigo-900 dark:text-indigo-300">
                        👋 {otherNewMembers.length} New Businesses
                      </span>{" "}
                      joined your chapter recently:{" "}
                      <span className="font-bold text-slate-900 dark:text-white">{otherNewMembers[0].businessName}</span>,{" "}
                      <span className="font-bold text-slate-900 dark:text-white">{otherNewMembers[1].businessName}</span>{" "}
                      <span className="text-xs font-semibold text-primary">+{otherNewMembers.length - 2} more...</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {otherNewMembers.length === 1 ? (
                  <>
                    {otherNewMembers[0].whatsapp ? (
                      <Button
                        asChild
                        size="sm"
                        className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg gap-1.5 shadow-xs"
                      >
                        <a
                          href={`https://wa.me/${(otherNewMembers[0].whatsapp || otherNewMembers[0].phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${otherNewMembers[0].userName}, welcome to the RIFAH Chamber! 🎉 We are excited to connect with ${otherNewMembers[0].businessName}. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.536 1.838.82 2.796.821 3.183 0 5.769-2.587 5.769-5.768.001-3.181-2.585-5.765-5.769-5.765zm0-2c4.28 0 7.769 3.488 7.769 7.768 0 4.28-3.489 7.768-7.769 7.768-.002 0-.005 0-.007 0-1.287 0-2.459-.344-3.484-.949l-4.54 1.192 1.213-4.434c-.664-1.077-1.04-2.316-1.04-3.577 0-4.28 3.489-7.768 7.769-7.768zm3.626 10.985c-.156.438-.806.829-1.291.884-.33.037-.761.06-2.222-.544-1.868-.772-3.078-2.678-3.171-2.802-.094-.124-.757-1.008-.757-1.923 0-.915.48-1.365.65-1.551.171-.186.374-.233.498-.233.125 0 .25.002.358.008.114.005.267-.043.418.32.156.373.532 1.298.578 1.392.047.094.078.203.016.327-.063.125-.094.203-.187.312-.094.11-.198.246-.282.33-.094.093-.192.195-.083.382.11.187.487.804 1.045 1.302.72.64 1.326.838 1.513.931.187.093.296.078.406-.047.11-.125.468-.546.593-.733.124-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.358.219.047.078.047.453-.109.891z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      </Button>
                    ) : null}

                    {otherNewMembers[0].userId && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs font-semibold rounded-lg gap-1 border-indigo-200 dark:border-indigo-800"
                      >
                        <Link href={`/biz/messages?recipient=${otherNewMembers[0].userId}`}>
                          <MessageSquare className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Message</span>
                        </Link>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => setIsNewMembersDialogOpen(true)}
                      className="h-7 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg gap-1 shadow-xs"
                    >
                      <span>👋</span>
                      <span>Welcome</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsNewMembersDialogOpen(true)}
                    className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg gap-1.5 shadow-xs"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>View & Welcome ({otherNewMembers.length})</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissNewMembers}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-full"
                  title="Dismiss banner"
                >
                  <X className="h-3.5 w-3.5" />
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


