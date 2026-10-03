"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Ticket, User, Mail, Briefcase, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@shared/components/ui/button";

function VerifyPassContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen flex items-center justify-center bg-gray-50/50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const name = searchParams.get("name") || "Attendee";
  const email = searchParams.get("email") || "N/A";
  const business = searchParams.get("business") || "";
  const eventName = searchParams.get("event") || "RIFAH Event";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-emerald-50 via-gray-50 to-emerald-50/30">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Registration Verified</h1>
            <p className="text-emerald-100 text-sm font-medium opacity-90">Valid Entry Pass</p>
          </div>
        </div>

        {/* Pass Details */}
        <div className="p-6 sm:p-8 space-y-6 relative">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-4 bg-gray-50 rounded-b-full shadow-inner border-b border-x border-emerald-100"></div>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100/80">
              <div className="mt-0.5">
                <Ticket className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Event Name</p>
                <p className="font-bold text-gray-800 text-base leading-tight">{eventName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100/80">
                <div className="mt-0.5">
                  <User className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Attendee Name</p>
                  <p className="font-bold text-gray-800 text-sm">{name}</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100/80">
                <div className="mt-0.5">
                  <Mail className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="font-bold text-gray-800 text-sm">{email}</p>
                </div>
              </div>

              {business && (
                <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100/80">
                  <div className="mt-0.5">
                    <Briefcase className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Business Name</p>
                    <p className="font-bold text-gray-800 text-sm">{business}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-dashed border-gray-200 text-center">
            <Button asChild variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 shadow-md hover:shadow-lg transition-all font-semibold">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPassPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50/50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <VerifyPassContent />
    </Suspense>
  );
}
