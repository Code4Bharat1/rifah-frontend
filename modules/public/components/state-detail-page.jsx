"use client";
import React from "react";
import Link from "next/link";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { useStateDetails } from "@shared/hooks/use-rifah-api";
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  UserCircle2, 
  Loader2 
} from "lucide-react";

export function StateDetailPage({ stateName }) {
  const decodedStateName = decodeURIComponent(stateName);
  const { data, isLoading, isError } = useStateDetails(decodedStateName);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p>Loading state details...</p>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !data) {
    return (
      <PublicLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground">
          <p>State not found or an error occurred.</p>
          <Link href="/presence" className="text-primary hover:underline mt-4">
            Return to Our Presence
          </Link>
        </div>
      </PublicLayout>
    );
  }

  // API response usually wraps data in { success: true, data: { ... } }
  const payload = data?.data || data;
  const { admin, profile, chapters, state } = payload || {};
  const displayName = profile?.name || state;
  const image = profile?.image || null;

  return (
    <PublicLayout>
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-14 sm:py-20 border-b border-white/5">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] pointer-events-none" />

        <div className="rifah-container relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Spacer (Balances the flex layout) */}
          <div className="hidden md:block md:w-1/4"></div>

          {/* Center: Title & Breadcrumbs */}
          <div className="text-center md:w-1/2 flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 capitalize animate-fade-in-up">
              {displayName}
            </h1>
            <div className="flex items-center text-xs md:text-sm text-blue-200 font-medium space-x-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <Link href="/presence" className="hover:text-white transition-colors">Our Presence</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white capitalize">{displayName}</span>
            </div>
          </div>

          {/* Right: Contact Info */}
          <div className="md:w-1/4 flex flex-col items-center md:items-start space-y-2.5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {profile?.phone ? (
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-7 w-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span className="text-slate-300">{profile.phone}</span>
              </div>
            ) : null}
            {profile?.email ? (
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-7 w-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="text-slate-300">{profile.email}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. Main Content Card */}
      <section className="rifah-container py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
          
          {/* Top Image */}
          <div className="w-full bg-slate-100 flex items-center justify-center border-b border-slate-100 relative min-h-[250px]">
             {image ? (
               <img src={image} alt={displayName} className="w-full max-h-[500px] object-cover" />
             ) : (
               <div className="py-24 text-slate-400 flex flex-col items-center">
                 <Globe className="h-16 w-16 mb-4 opacity-50" />
                 <span className="text-lg font-medium">No Image Available</span>
               </div>
             )}
          </div>

          {/* Details Table */}
          <div className="p-8 md:p-12">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
                <div className="font-bold text-slate-700 md:col-span-1">Address</div>
                <div className="text-slate-600 md:col-span-2">{profile?.address || displayName}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
                <div className="font-bold text-slate-700 md:col-span-1">Office Phone</div>
                <div className="text-primary font-medium md:col-span-2">{profile?.phone || "N/A"}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
                <div className="font-bold text-slate-700 md:col-span-1">Email Address</div>
                <div className="text-primary font-medium md:col-span-2">{profile?.email || "N/A"}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
                <div className="font-bold text-slate-700 md:col-span-1">State President / Admin</div>
                <div className="text-primary font-medium md:col-span-2">{admin?.name || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Table */}
        <div className="max-w-4xl mx-auto mt-12 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Chapters in {displayName}</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#f5e1c0] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fff9f0] border-b border-[#f5e1c0]">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-800">Chapter Name</th>
                  <th className="px-6 py-4 font-bold text-slate-800 w-1/3 border-l border-[#f5e1c0]">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5e1c0]">
                {chapters?.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-8 text-center text-slate-500">
                      No chapters registered in this state yet.
                    </td>
                  </tr>
                ) : (
                  chapters?.map((ch) => (
                    <tr key={ch._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">{ch.name}</td>
                      <td className="px-6 py-4 text-primary border-l border-[#f5e1c0]">{ch.state}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default StateDetailPage;
