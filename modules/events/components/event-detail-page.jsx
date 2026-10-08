"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, MapPin, Share2, Ticket, Users, Video, Download } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";
import { downloadTicketPdf } from "@shared/lib/ticket-pdf-generator";
import dynamic from "next/dynamic";

const StaticMap = dynamic(
  () => import("@shared/components/rifah/static-map").then((mod) => mod.StaticMap),
  { ssr: false }
);

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { Input } from "@shared/components/ui/input";
import { PhoneInput } from "@shared/components/ui/phone-input";
import { Label } from "@shared/components/ui/label";
import { Pill } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { FieldRow, Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Progress } from "@shared/components/ui/progress";
import { eventImage } from "@shared/lib/media";
import { useEventDetail, useEvents } from "@shared/hooks/use-rifah-api";
import { eventApi, paymentApi, authApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { EventShareModal } from "@shared/components/rifah/event-share-modal";
import { getEventStatus, getEventStatusConfig, parseEventTiming, formatEventDate } from "@shared/lib/event-utils";

function EventDetail() {
  const params = useParams();
  const eventId = params?.eventId;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useEventDetail(eventId);
  const { data: othersData } = useEvents({ status: "Upcoming", limit: 3 });

  const others = Array.isArray(othersData) ? othersData : (othersData?.events || []);

  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [emailExistsPopup, setEmailExistsPopup] = useState(false);

  const userRegistration = user?._id && Array.isArray(event?.registeredUsers) 
    ? event.registeredUsers.find(u => String(u?.user?._id || u?.user || u?._id || u) === String(user._id)) 
    : null;

  const isUserRegistered = Boolean(registered || userRegistration);
  
  const [attended, setAttended] = useState(false);
  const [marking, setMarking] = useState(false);

  // Registration Flow State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regPath, setRegPath] = useState(null); // 'member' | 'guest'
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Guest Form State
  const [guestForm, setGuestForm] = useState({ name: "", email: "", phone: "", businessName: "" });

  const isUserAttended = Boolean(attended || userRegistration?.attendanceStatus === "Present");

  const isEventToday = event?.date === new Date().toISOString().split("T")[0];

  const canRegisterUser = () => {
    if (!event) return true;
    if (!user) return true; // Let them click and redirect to login
    
    // All admins can see the button
    if (["central_admin", "state_admin", "chapter_admin"].includes(user.role)) return true;
    
    const roleDisplay = user.role === "business_owner" ? "Businesses" : "Consumers";
    
    const audiences = (event?.targetAudience || []).map(a => (typeof a === "string" ? a.trim().toLowerCase() : ""));
    const audienceMatch = audiences.length === 0 || audiences.includes("all") || audiences.includes(roleDisplay.toLowerCase());
    if (!audienceMatch) return false;

    if (event?.targetStates && event.targetStates.length > 0) {
      const states = event.targetStates.map(s => (typeof s === "string" ? s.trim().toLowerCase() : ""));
      if (!states.includes("all") && user.state) {
        if (!states.includes(user.state.trim().toLowerCase())) return false;
      }
    }

    if (event?.targetChapters && event.targetChapters.length > 0) {
      const chapters = event.targetChapters.map(c => (typeof c === "string" ? c.trim().toLowerCase() : ""));
      if (!chapters.includes("all") && user.chapter) {
        if (!chapters.includes(user.chapter.trim().toLowerCase())) return false;
      }
    }

    return true;
  };

  const isEligibleToRegister = canRegisterUser();
  const isEventPaid = Boolean(
    event?.isPaid === true || 
    event?.isPaid === "true" || 
    event?.isPaid === "Paid" || 
    Number(event?.ticketPrice) > 0 || 
    Number(event?.memberPrice) > 0 || 
    (event?.fee && event.fee !== "Free" && event.fee !== "Complimentary for Members")
  );
  
  const guestBase = Number(event?.ticketPrice) || (event?.fee ? parseInt(event.fee.replace(/\D/g, '')) || 0 : 0);
  const guestPrice = guestBase;
  const guestGst = Math.round(guestBase * 0.18);
  const guestTotal = guestBase + guestGst;

  const memberBase = Number(event?.memberPrice) || 0;
  const memberPrice = memberBase;
  const memberGst = Math.round(memberBase * 0.18);
  const memberTotal = memberBase + memberGst;

  const isCustomerUser = user && ["customer", "buyer"].includes(user.role);


const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

  const handleRegisterClick = () => {
    if (!user) {
      setIsRegModalOpen(true);
      setRegPath(null);
    } else {
      setIsRegModalOpen(true);
      setRegPath("member");
    }
  };

  const handleFinalRegister = async () => {
    if (regPath === "guest") {
      if (!guestForm.name || !guestForm.email || !guestForm.phone) {
        toast.error("Please fill all required fields (Name, Email, Phone).");
        return;
      }
    }

    setRegistering(true);

    try {
      if (regPath === "guest") {
        try {
          const pwd = `Guest@${Math.floor(Math.random() * 90000) + 10000}`;
          const regRes = await authApi.register({
            name: guestForm.name,
            email: guestForm.email,
            phone: guestForm.phone,
            password: pwd,
            chapter: "General",
            organization: guestForm.businessName || "Guest User",
            isGuestCheckout: true,
          });
          const responseData = regRes?.data || regRes;
          if (responseData?.accessToken) {
            localStorage.setItem("rifah_access_token", responseData.accessToken);
            if (responseData.refreshToken) localStorage.setItem("rifah_refresh_token", responseData.refreshToken);
          }
        } catch (regErr) {
          if (regErr.message && regErr.message.toLowerCase().includes("already exists")) {
            setEmailExistsPopup(true);
          } else {
            toast.error(regErr.message || "Failed to setup guest session.");
          }
          setRegistering(false);
          return;
        }
      }
      const baseAmount = (isEventPaid && regPath === "member" && !isCustomerUser && event?.memberPrice !== undefined) 
        ? memberBase 
        : guestBase;
      const gstAmount = Math.round(baseAmount * 0.18);
      const finalAmount = baseAmount + gstAmount;

      if (isEventPaid && finalAmount > 0) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) throw new Error("Razorpay not loaded");

        // Use any backend endpoint that creates an order
        const orderRes = await paymentApi.createOrder({
          amount: finalAmount,
          baseAmount,
          gstAmount,
          gstRate: 18,
          currency: "INR",
          eventId: event?._id,
          itemType: "Event Pass",
          description: `Pass for ${event?.title} (Incl. 18% GST)`,
        });

        const orderData = orderRes?.data || orderRes;
        
        const options = {
          key: orderData.keyId || "rzp_test_TTykh9OVkLKNHl",
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "RIFAH Events",
          description: `Pass for ${event?.title} (Incl. 18% GST)`,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              setRegistering(true);

              // Run both in parallel — no need to wait for one before the other
              await Promise.all([
                // Creates Payment record in DB
                paymentApi.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: finalAmount,
                  baseAmount,
                  gstAmount,
                  gstRate: 18,
                  currency: "INR",
                  itemType: "Event Pass",
                  eventId: event?._id,
                  description: `Event Pass: ${event?.title} (Incl. 18% GST)`,
                  guest: regPath === "guest" ? guestForm : undefined,
                }),
                // Registers user on the event
                eventApi.registerPaid(event?._id, {
                  paymentId: response.razorpay_payment_id,
                  transactionId: response.razorpay_order_id,
                  amount: finalAmount,
                  baseAmount,
                  gstAmount,
                  guest: regPath === "guest" ? guestForm : undefined,
                }),
              ]);

              setRegistered(true);
              setIsRegModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["event", eventId] });
              queryClient.invalidateQueries({ queryKey: ["events"] });
              queryClient.invalidateQueries({ queryKey: ["all-payments"] });
              toast.success("Registration Successful! Your ticket and confirmation details have been sent to your email address.", { duration: 5000 });
            } catch (err) {
              console.error("Event payment error:", err);
              toast.error(err.message || "Registration failed after payment.");
            } finally {
              setRegistering(false);
            }
          },
          prefill: {
            name: regPath === "guest" ? guestForm.name : (user?.name || ""),
            email: regPath === "guest" ? guestForm.email : (user?.email || ""),
            contact: regPath === "guest" ? guestForm.phone : (user?.phone || ""),
          },
          theme: { color: "#0F2942" },
          modal: { ondismiss: () => setRegistering(false) }
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => toast.error("Payment failed."));
        rzp.open();
        return;
      }

      await eventApi.register(event?._id);
      setRegistered(true);
      setIsRegModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Registration Successful! Your confirmation details have been sent to your email address.", { duration: 5000 });
    } catch (err) {
      console.error("Register error:", err);
      const message = err.message || "Failed to register for this event";
      if (message.toLowerCase().includes("already registered")) {
        setRegistered(true);
        toast.info("You are already registered for this event!");
      } else {
        toast.error(message);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!user) return;
    setMarking(true);
    try {
      await eventApi.markAttendance(event?._id);
      setAttended(true);
      toast.success("Attendance marked successfully!");
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    } catch (err) {
      console.error("Attendance error:", err);
      toast.error(err.message || "Failed to mark attendance.");
    } finally {
      setMarking(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="rifah-container py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading event details...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="rifah-container py-16 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This event may have ended or been rescheduled.</p>
          <Button asChild className="mt-6">
            <Link href="/events">Back to events</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const coverUrl = event.coverImage ? resolveMediaUrl(event.coverImage) : eventImage;

  const totalSeats = event.totalSeats || 0;
  const registeredCount = event.registeredCount || 0;
  const isFull = totalSeats > 0 && registeredCount >= totalSeats;
  const isRegistrationClosedManually = Boolean(event.isRegistrationClosed || event.seatsFull);
  const isRegistrationPastDeadline = Boolean(event.registrationClosingDate && new Date() > new Date(event.registrationClosingDate));
  const isRegistrationClosed = isFull || isRegistrationClosedManually || isRegistrationPastDeadline;
  const seatsRemaining = totalSeats > 0 ? totalSeats - registeredCount : null;
  const seatsPercentage = totalSeats > 0 ? Math.min(100, Math.round((registeredCount / totalSeats) * 100)) : 0;

  return (
    <PublicLayout>
      {/* Immersive Hero Header */}
      <section className="relative w-full overflow-hidden border-b border-border">
        {/* Full Banner Image */}
        <img
          src={coverUrl}
          alt={`${event.title} — RIFAH event`}
          className="w-full h-auto block"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Overlay Content — sits on top of the image */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 sm:py-6">
          {/* Top: Back link */}
          <div className="rifah-container w-full">
            <Link href="/events" className="inline-flex items-center text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow-md">
              ← Back to all events
            </Link>
          </div>

          {/* Bottom: Pills, Title + Share Event */}
          <div className="rifah-container w-full flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white max-w-4xl leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] mb-2 sm:mb-3">
                {event.title}
              </h1>

              {(() => {
                const computedStatus = getEventStatus(event);
                const statusConfig = getEventStatusConfig(computedStatus);
                return (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Pill tone={event.mode === "Online" ? "primary" : "neutral"} className="bg-white/15 text-white border-white/25 backdrop-blur-md shadow-sm text-xs">{event.mode}</Pill>
                    <Pill className="bg-white/15 text-white border-white/25 backdrop-blur-md shadow-sm text-xs">{event.chapter}</Pill>
                    <Pill tone={statusConfig.tone} className={`${statusConfig.className} shadow-sm backdrop-blur-md text-xs`}>
                      {statusConfig.dot && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1" />}
                      {statusConfig.label}
                    </Pill>
                  </div>
                );
              })()}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md gap-2 rounded-full px-4 text-xs font-semibold shadow-xs cursor-pointer shrink-0"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Event</span>
            </Button>
          </div>
        </div>
      </section>

      <div className="rifah-container pt-6 sm:pt-10 pb-5 sm:pb-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Details */}
          <div className="space-y-6">
            {/* Metadata Grid */}
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
              <dl className="grid grid-cols-2 gap-y-5 gap-x-4 sm:grid-cols-3">
                {[
                  { icon: CalendarDays, label: "Date", value: formatEventDate(event.date) || "TBA", colSpan: "col-span-1" },
                  { icon: Clock, label: "Time", value: event.time || "TBA", colSpan: "col-span-1" },
                  { icon: MapPin, label: "Venue", value: event.venue || "TBA", colSpan: "col-span-2 sm:col-span-1" },
                ].map((s) => (
                  <div key={s.label} className={cn("min-w-0", s.colSpan)}>
                    <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <s.icon className="h-4 w-4" />
                      </span>
                      {s.label}
                    </dt>
                    <dd className="mt-2 text-sm font-semibold text-foreground sm:text-base break-words">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Full Description & Agenda */}
            {(event.description || event.summary) && (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3">Full Description & Agenda</h2>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description || event.summary}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-4">
              {event.agenda && event.agenda.length > 0 && (
                <Panel title="Agenda">
                  <div className="relative border-l-2 border-primary/20 ml-3 space-y-6">
                    {event.agenda.map((a, i) => (
                      <div key={i} className="relative pl-6">
                        <span className="absolute -left-[9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.1)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                          <span className="text-sm font-bold text-primary sm:w-24 shrink-0">{a.time}</span>
                          <span className="text-sm font-medium text-foreground">{a.item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
              <Panel title="Event details">
                <dl>
                  <FieldRow label="Organiser" value={event.organizer} />
                  <FieldRow label="Chapter" value={event.chapter} />
                  {event.eventCategory && <FieldRow label="Category" value={event.eventCategory} />}
                  {event.industrySector && <FieldRow label="Industry Sector" value={event.industrySector} />}
                  <FieldRow label="Mode" value={event.mode} />
                  <FieldRow label="Location" value={`${event.venue || ""}${event.city ? `, ${event.city}` : ""}`} />
                  {totalSeats > 0 ? (
                    <div className="grid grid-cols-[minmax(0,40%)_minmax(0,1fr)] gap-3 border-b border-border py-2.5 last:border-0 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
                      <dt className="text-xs font-medium text-muted-foreground sm:text-sm pt-1">Capacity</dt>
                      <dd className="min-w-0 text-sm font-medium">
                        <div className="space-y-2 max-w-sm">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground">Seats Filled</span>
                            <span className={`font-bold ${isFull ? 'text-destructive' : 'text-primary'}`}>
                              {isFull ? 'Full' : `${seatsRemaining} Available`}
                            </span>
                          </div>
                          <Progress value={seatsPercentage} className={`h-2 ${isFull ? '[&>div]:bg-destructive' : ''}`} />
                          <p className="text-[10px] text-muted-foreground text-center">
                            {registeredCount} / {totalSeats} seats booked
                          </p>
                        </div>
                      </dd>
                    </div>
                  ) : (
                    <FieldRow label="Total Capacity" value="Unlimited" />
                  )}
                  {isEventPaid ? (
                    <>
                      <FieldRow label="Member Fee" value={`₹${memberPrice}`} />
                      <FieldRow label="Non-Member Fee" value={`₹${guestPrice}`} />
                    </>
                  ) : (
                    <FieldRow label="Participation fee" value={(event.fee && event.fee !== "Complimentary for Members" ? event.fee : "Free")} />
                  )}
                  <FieldRow label="Who should attend" value="Member businesses, buyers and chapter invitees" />
                </dl>
              </Panel>
              
              {event.venue && event.venue.length > 3 && (
                <Panel title="Event Location Map">
                  <div className="w-full rounded-2xl overflow-hidden border border-border shadow-sm h-[350px] bg-muted/50 relative">
                    <StaticMap address={event.venue + (event.city && !event.venue.toLowerCase().includes(event.city.toLowerCase()) ? `, ${event.city}` : '')} />
                  </div>
                </Panel>
              )}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {event.posterImage && (
              <div className="overflow-hidden rounded-2xl border border-border shadow-sm bg-surface">
                <img 
                  src={resolveMediaUrl(event.posterImage)} 
                  alt={`${event.title} Poster`}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            {["central_admin", "state_admin", "chapter_admin"].includes(user?.role) && (
              <Panel title="Admin View">
                <div className="space-y-3 text-center">
                  <p className="text-sm text-muted-foreground">You are viewing this event as an admin.</p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={
                      user?.role === "chapter_admin" ? `/chapter-admin/events/${event._id}` 
                      : user?.role === "state_admin" ? `/state-admin/events/${event._id}` 
                      : `/admin/events/${event._id}`
                    }>
                      Open in Admin Panel
                    </Link>
                  </Button>
                </div>
              </Panel>
            )}

            <Panel 
              title="Registration" 
              className="border-primary/20 bg-surface/80 backdrop-blur-xl shadow-lg ring-1 ring-primary/10"
            >
              {isUserRegistered ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center shadow-inner">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">You are registered!</p>
                  <p className="mt-1.5 text-xs text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed">
                    Confirmation has been recorded. Joining details will be shared prior to the session.
                  </p>
                  <div className="mt-4 pt-4 border-t border-emerald-500/20 text-xs flex justify-between items-center">
                    <span className="font-medium text-emerald-700/70 dark:text-emerald-300/70">Status</span>
                    <span className="font-bold text-emerald-600 px-2 py-1 bg-emerald-500/10 rounded-md">RSVP Confirmed</span>
                  </div>
                  <div className="mt-5 flex flex-col items-center justify-center space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-500/20 w-full relative overflow-hidden">
                      {(() => {
                        const myUserId = String(user?._id || user?.id || "");
                        const userReg = (event?.registeredUsers || []).find((reg) => {
                          const regUserId = String(reg?.user?._id || reg?.user || reg?._id || reg);
                          return regUserId === myUserId;
                        });

                        const qrUserName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Member') : (guestForm.name || 'Attendee');
                        const qrUserEmail = user ? user.email : (guestForm.email || 'N/A');
                        const qrUserBusiness = user?.businessName || guestForm.businessName || '';
                        const qrEventName = event?.title || '';
                        const ticketId = userReg?.ticketId || `RIFAH-EVT-${new Date().getFullYear()}-${String(event?._id || '').slice(-4).toUpperCase()}`;
                        const verificationToken = userReg?.verificationToken || '';
                        const ticketType = userReg?.ticketType || (isEventPaid ? "Paid Pass" : "Member Pass");
                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                        const tokenQuery = verificationToken ? `?token=${encodeURIComponent(verificationToken)}` : '';
                        const secureVerifyUrl = `${origin}/verify/ticket/${encodeURIComponent(ticketId)}${tokenQuery}`;

                        const handleDownloadPass = async () => {
                          try {
                            await downloadTicketPdf({
                              ticketId,
                              attendeeName: qrUserName,
                              attendeeEmail: qrUserEmail,
                              attendeeCompany: qrUserBusiness,
                              eventTitle: qrEventName,
                              eventDate: formatEventDate(event.date),
                              eventTime: event.time,
                              eventVenue: event.venue || event.location || "Chamber Main Hall",
                              eventCity: event.city || "",
                              ticketType,
                              paymentStatus: userReg?.paymentStatus || (isEventPaid ? "PAID" : "COMPLIMENTARY"),
                              amountPaid: userReg?.amountPaid || (isEventPaid ? event.ticketPrice : 0),
                              verificationUrl: secureVerifyUrl,
                            });
                            toast.success("Ticket PDF downloaded!");
                          } catch (e) {
                            toast.error("Could not download ticket PDF");
                          }
                        };
                        
                        return (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-2">
                              <p className="text-[10px] text-emerald-600/90 font-bold uppercase tracking-widest">Digital Entry Pass</p>
                              <span className="text-[10px] font-mono text-muted-foreground font-semibold">{ticketId}</span>
                            </div>
                            <div className="p-2 bg-white rounded-xl mb-1 border border-gray-100 shadow-sm">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(secureVerifyUrl)}`} 
                                alt="Registration QR Code" 
                                className="w-32 h-32"
                              />
                            </div>
                            <a href={`/verify/ticket/${ticketId}${tokenQuery}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 hover:underline font-semibold mb-3">
                              View Verification Link
                            </a>
                            
                            {/* Dashed divider representing ticket tear */}
                            <div className="w-full border-t-2 border-dashed border-gray-200 my-2 relative">
                              <div className="absolute -left-6 -top-3 w-6 h-6 bg-emerald-500/10 rounded-full"></div>
                              <div className="absolute -right-6 -top-3 w-6 h-6 bg-emerald-500/10 rounded-full"></div>
                            </div>
                            
                            {/* Ticket Details */}
                            <div className="w-full text-left space-y-2.5 mt-2 px-1">
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Attendee</p>
                                  <p className="font-bold text-gray-800 text-sm truncate">{qrUserName}</p>
                                </div>
                                <div className="text-right min-w-0 shrink-0 max-w-[45%]">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Event</p>
                                  <p className="font-bold text-gray-800 text-sm truncate">{qrEventName}</p>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                                  <p className="font-semibold text-gray-600 text-[11px] truncate">{qrUserEmail}</p>
                                </div>
                                {qrUserBusiness && (
                                  <div className="text-right min-w-0 shrink-0 max-w-[45%]">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Business</p>
                                    <p className="font-semibold text-gray-600 text-[11px] truncate">{qrUserBusiness}</p>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2">
                                <Button
                                  type="button"
                                  onClick={handleDownloadPass}
                                  variant="outline"
                                  className="w-full h-9 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 font-semibold text-xs gap-1.5"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Ticket PDF</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {event.meetingLink && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/20 text-center">
                      {getEventStatus(event) === "Ended" ? (
                        <div className="rounded-lg bg-black/5 dark:bg-white/5 p-3 text-center border border-emerald-500/10">
                          <p className="text-sm font-bold text-emerald-800/60 dark:text-emerald-200/60 flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4" /> Event Ended
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                            {formatEventDate(event.date)} at {event.time}
                          </p>
                          <Button 
                            asChild
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:shadow-lg gap-2" 
                          >
                            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4" /> Join Meeting
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-emerald-500/20">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsShareModalOpen(true)}
                      className="w-full gap-2 rounded-xl text-xs font-semibold border-emerald-500/30 bg-white/40 dark:bg-black/20 hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                    >
                      <Share2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Invite Colleagues & Partners</span>
                    </Button>
                  </div>
                </div>
              ) : getEventStatus(event) === "Ended" ? (
                <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-base font-bold text-foreground">Event Ended</p>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    This event has concluded. Registrations and attendance submissions are closed.
                  </p>
                </div>
              ) : isEligibleToRegister ? (
                <div className="space-y-5">
                  <div className="flex flex-col border-b border-border pb-4 gap-3">
                    {isEventPaid ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Member Price</p>
                            <p className="text-2xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400">
                              ₹{memberTotal}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-medium">
                              (₹{memberBase} + 18% GST)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Guest Price</p>
                            <p className="text-xl font-bold tracking-tight text-foreground">
                              ₹{guestTotal}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-medium">
                              (₹{guestBase} + 18% GST)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
                          <span className="font-semibold text-foreground">Note:</span>
                          <span>18% GST is added to pass payments at checkout.</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pass Price</p>
                        <p className="text-3xl font-extrabold tracking-tight text-foreground">
                          {event.fee && event.fee !== "Complimentary for Members" ? event.fee : "Free"}
                        </p>
                      </div>
                    )}
                  </div>
                  {totalSeats > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span className="text-muted-foreground">Seats Filled</span>
                        <span className={isFull ? "text-destructive font-bold" : "text-primary font-bold"}>
                          {isFull ? "Full" : `${seatsRemaining} remaining`}
                        </span>
                      </div>
                      <Progress value={seatsPercentage} className={`h-2.5 ${isFull ? '[&>div]:bg-destructive' : ''}`} />
                      <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                        {registeredCount} / {totalSeats} seats booked
                      </p>
                    </div>
                  )}
                  <Button
                    className={`w-full text-base font-bold shadow-md transition-all ${isRegistrationClosed ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/10 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'}`}
                    size="lg"
                    disabled={registering || isRegistrationClosed}
                    onClick={isRegistrationClosed ? undefined : handleRegisterClick}
                  >
                    {registering ? "Processing..." : (isFull || event?.seatsFull) ? "Seats Full" : isRegistrationClosed ? "Registration Closed" : "RSVP / Register Now"}
                  </Button>
                  {isRegistrationClosed && (
                    <p className="text-xs text-center font-medium text-destructive mt-1">
                      {isRegistrationPastDeadline ? "Registration deadline has passed." : "Registrations are currently closed / seats full."}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 rounded-xl text-xs font-semibold border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    <Share2 className="h-3.5 w-3.5 text-primary" />
                    <span>Share Event with Network</span>
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Restricted Event</p>
                  <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
                    This event is exclusively for targeted members and chapters. Your profile does not match the event's audience.
                  </p>
                </div>
              )}
            </Panel>

            {others.length > 0 && (
              <Panel title="Other upcoming events">
                <ul className="space-y-3">
                  {others.map((o) => (
                    <li key={o._id || o.slug}>
                      <Link href={`/events/${o.slug || o._id}`} className="group block">
                        <p className="text-xs font-semibold text-primary">{o.date ? new Date(o.date).toLocaleDateString() : ""}</p>
                        <p className="text-sm font-medium leading-snug group-hover:underline">{o.title}</p>
                        <p className="text-xs text-muted-foreground">{o.city} · {o.mode}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </aside>
        </div>
      </div>

      <Dialog open={isRegModalOpen} onOpenChange={setIsRegModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Event Registration</DialogTitle>
          </DialogHeader>
          
          {!regPath && (
            <div className="py-6 space-y-4 text-center">
              <h3 className="font-semibold text-lg">Are you a RIFAH Member?</h3>
              <p className="text-sm text-muted-foreground mb-6">Members receive exclusive discounts on event passes.</p>
              
              <div className="space-y-3">
                <Button 
                  className="w-full font-bold" 
                  size="lg"
                  onClick={() => {
                    if (!user) {
                      toast.info("Please log in to verify your membership.");
                      window.location.href = `/login?redirect=/events/${eventId || event?.slug}`;
                    } else {
                      setRegPath("member");
                    }
                  }}
                >
                  Yes, I am a Member
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setRegPath("guest")}
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          )}

          {regPath === "guest" && (
            <div className="space-y-4 py-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => setRegPath(null)} className="h-8 px-2 -ml-2 text-muted-foreground">
                  ← Back
                </Button>
                <h3 className="font-semibold">Guest Registration</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Full Name *</Label>
                  <Input value={guestForm.name} onChange={e => setGuestForm({...guestForm, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Email *</Label>
                  <Input type="email" value={guestForm.email} onChange={e => setGuestForm({...guestForm, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Phone Number *</Label>
                  <PhoneInput value={guestForm.phone} onChange={e => setGuestForm({...guestForm, phone: e.target.value})} placeholder="Mobile number" />
                </div>
                <div className="space-y-1">
                  <Label>Business Name (Optional)</Label>
                  <Input value={guestForm.businessName} onChange={e => setGuestForm({...guestForm, businessName: e.target.value})} />
                </div>
              </div>
              
              {isEventPaid && (
                <div className="mt-6 p-4 rounded-xl bg-muted/30 border space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Pass Base Price</span>
                    <span>₹{guestBase}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>GST (18%)</span>
                    <span>₹{guestGst}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg text-foreground">
                    <span>Total Payable</span>
                    <span>₹{guestTotal}</span>
                  </div>
                </div>
              )}
              <Button className="w-full mt-4" size="lg" onClick={handleFinalRegister} disabled={registering}>
                {registering ? "Processing..." : (isEventPaid ? `Pay ₹${guestTotal} & Register` : "Register Now")}
              </Button>
            </div>
          )}

          {regPath === "member" && (
            <div className="space-y-4 py-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                {!user && (
                  <Button variant="ghost" size="sm" onClick={() => setRegPath(null)} className="h-8 px-2 -ml-2 text-muted-foreground">
                    ← Back
                  </Button>
                )}
                <h3 className="font-semibold">{isCustomerUser ? "Guest Checkout" : "Member Checkout"}</h3>
              </div>

              {isEventPaid && (
                <div className="mt-6 p-4 rounded-xl bg-muted/30 border space-y-2">
                  {!isCustomerUser ? (
                    <>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Guest Price</span>
                        <span><del>₹{guestTotal}</del></span>
                      </div>
                      <div className="flex justify-between text-sm text-emerald-600 font-medium">
                        <span>Member Base Price</span>
                        <span>₹{memberBase}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>GST (18%)</span>
                        <span>₹{memberGst}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg text-foreground">
                        <span>Total Payable</span>
                        <span>₹{memberTotal}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Pass Base Price</span>
                        <span>₹{guestBase}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>GST (18%)</span>
                        <span>₹{guestGst}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg text-foreground">
                        <span>Total Payable</span>
                        <span>₹{guestTotal}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <Button className="w-full mt-4" size="lg" onClick={handleFinalRegister} disabled={registering}>
                {registering ? "Processing..." : (isEventPaid ? `Pay ₹${!isCustomerUser ? memberTotal : guestTotal} & Register` : "Register for Free")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EventShareModal
        event={event}
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
      />

      <Dialog open={emailExistsPopup} onOpenChange={setEmailExistsPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Action Required</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-base text-foreground mb-6 font-medium">
              This email is already registered
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="default"
                size="lg"
                onClick={() => {
                  setEmailExistsPopup(false);
                  setRegPath("member");
                }}
              >
                Continue As a Member?
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setEmailExistsPopup(false);
                  setGuestForm(prev => ({ ...prev, email: "" }));
                }}
              >
                Continue as a Guest?
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}

export { EventDetail as EventDetailPage };
export default EventDetail;
