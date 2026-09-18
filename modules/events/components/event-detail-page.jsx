"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MapPin, Share2, Ticket, Users } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@shared/providers/auth-provider";

import { Pill } from "@shared/components/rifah/badges";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { FieldRow, Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { eventImage } from "@shared/lib/media";
import { useEventDetail, useEvents } from "@shared/hooks/use-rifah-api";
import { eventApi, paymentApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";

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

  const userRegistration = user?._id && Array.isArray(event?.registeredUsers) 
    ? event.registeredUsers.find(u => String(u?.user?._id || u?.user || u?._id || u) === String(user._id)) 
    : null;

  const isUserRegistered = Boolean(registered || userRegistration);
  
  const [attended, setAttended] = useState(false);
  const [marking, setMarking] = useState(false);

  const isUserAttended = Boolean(attended || userRegistration?.attendanceStatus === "Present");

  const isEventToday = event?.date === new Date().toISOString().split("T")[0];

  const canRegisterUser = () => {
    if (!event) return true;
    if (!user) return true; // Let them click and redirect to login
    
    // All admins can see the button
    if (["super_admin", "secretariat", "state_admin", "chapter_admin"].includes(user.role)) return true;
    
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

  const handleRegister = async () => {
    if (!user) {
      toast.info("Please log in to RSVP / register for this event");
      window.location.href = `/login?redirect=/events/${eventId || event?.slug}`;
      return;
    }

    if (isUserRegistered) {
      toast.info("You are already registered for this event!");
      return;
    }

    setRegistering(true);

    const isPaidEvent = Boolean(event?.isPaid && Number(event?.ticketPrice) > 0);

    if (isPaidEvent) {
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) throw new Error("Razorpay not loaded");

        // Use any backend endpoint that creates an order
        // For events, we can use the same paymentApi.createOrder
        // We'll pass itemType="Event Pass" and eventId
        const orderRes = await paymentApi.createOrder({
          amount: event?.ticketPrice,
          currency: "INR",
          eventId: event?._id,
          itemType: "Event Pass",
          description: `Pass for ${event?.title}`,
        });

        const orderData = orderRes?.data || orderRes;
        
        const options = {
          key: orderData.keyId || "rzp_test_TTykh9OVkLKNHl",
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "RIFAH Events",
          description: `Pass for ${event?.title}`,
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
                  amount: event?.ticketPrice,
                  currency: "INR",
                  itemType: "Event Pass",
                  eventId: event?._id,
                  description: `Event Pass: ${event?.title}`,
                }),
                // Registers user on the event
                eventApi.registerPaid(event?._id, {
                  paymentId: response.razorpay_payment_id,
                  transactionId: response.razorpay_order_id,
                }),
              ]);

              setRegistered(true);
              queryClient.invalidateQueries({ queryKey: ["event", eventId] });
              queryClient.invalidateQueries({ queryKey: ["events"] });
              queryClient.invalidateQueries({ queryKey: ["all-payments"] });
              toast.success("Payment successful! You are registered.");
            } catch (err) {
              console.error("Event payment error:", err);
              toast.error(err.message || "Registration failed after payment.");
            } finally {
              setRegistering(false);
            }
          },
          prefill: {
            name: user.name || "",
            email: user.email || "",
          },
          theme: { color: "#0F2942" },
          modal: { ondismiss: () => setRegistering(false) }
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => toast.error("Payment failed."));
        rzp.open();
      } catch (err) {
        setRegistering(false);
        console.error("Payment init error:", err);
        toast.error(err.message || "Failed to initialize payment gateway.");
      }
      return;
    }

    try {
      await eventApi.register(event?._id);
      setRegistered(true);
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("RSVP confirmed! You are registered for this event.");
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

  return (
    <PublicLayout>
      {/* Immersive Hero Header */}
      <section className="relative w-full bg-slate-950 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <img
            src={coverUrl}
            alt={`${event.title} — RIFAH event`}
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="rifah-container relative z-10 pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-20">
          <Link href="/events" className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors mb-6">
            ← Back to all events
          </Link>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Pill tone={event.mode === "Online" ? "primary" : "neutral"} className="bg-white/10 text-white border-white/20 backdrop-blur-md shadow-sm">{event.mode}</Pill>
            <Pill className="bg-white/10 text-white border-white/20 backdrop-blur-md shadow-sm">{event.chapter}</Pill>
            <Pill tone={event.status === "Upcoming" ? "success" : "neutral"} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-md shadow-sm">{event.status}</Pill>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl max-w-4xl leading-[1.15]">
            {event.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {event.summary || event.description || "Join this chamber event to connect with members and businesses."}
          </p>
        </div>
      </section>

      <div className="rifah-container py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Details */}
          <div className="space-y-8">
            {/* Metadata Grid */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <dl className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-4">
                  {[
                    { icon: CalendarDays, label: "Date", value: event.date ? new Date(event.date).toLocaleDateString() : "TBA" },
                    { icon: Clock, label: "Time", value: event.time },
                    { icon: MapPin, label: "Venue", value: event.venue },
                    { icon: Users, label: "Capacity", value: `${event.seats} seats` },
                  ].map((s) => (
                    <div key={s.label} className="min-w-0">
                      <dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <s.icon className="h-4 w-4" />
                        </span>
                        {s.label}
                      </dt>
                      <dd className="mt-2 text-sm font-semibold text-foreground sm:text-base">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

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
                  <FieldRow label="Mode" value={event.mode} />
                  <FieldRow label="Location" value={`${event.venue || ""}${event.city ? `, ${event.city}` : ""}`} />
                  <FieldRow label="Participation fee" value={Boolean(event.isPaid && Number(event.ticketPrice) > 0) ? `₹${event.ticketPrice}` : (event.fee && event.fee !== "Complimentary for Members" ? event.fee : "Free")} />
                  <FieldRow label="Who should attend" value="Member businesses, buyers and chapter invitees" />
                </dl>
              </Panel>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {["super_admin", "secretariat", "chapter_admin", "state_admin"].includes(user?.role) && (
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
                  {isEventToday && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/20">
                      {isUserAttended ? (
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-500/10 py-2.5 rounded-lg">
                          <CheckCircle2 className="h-4 w-4" /> Attendance Marked
                        </div>
                      ) : (
                        <Button 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg" 
                          onClick={handleMarkAttendance} 
                          disabled={marking}
                        >
                          {marking ? "Marking..." : "Mark Attendance Now"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : isEligibleToRegister ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pass Price</p>
                      <p className="text-3xl font-extrabold tracking-tight text-foreground">
                        {Boolean(event.isPaid && Number(event.ticketPrice) > 0) ? `₹${event.ticketPrice}` : (event.fee && event.fee !== "Complimentary for Members" ? event.fee : "Free")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Availability</p>
                      <p className="text-sm font-bold text-primary">
                        {Math.max(0, (event.seats || 100) - (event.registeredCount || 0))} seats left
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full text-base font-bold shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    size="lg"
                    disabled={registering}
                    onClick={handleRegister}
                  >
                    {registering ? "Processing..." : "RSVP / Register Now"}
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
    </PublicLayout>
  );
}

export { EventDetail as EventDetailPage };
export default EventDetail;
