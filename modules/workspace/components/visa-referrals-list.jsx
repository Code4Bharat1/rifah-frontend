"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Plane,
  Plus,
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  FileText,
  Loader2,
  Truck,
  PackageCheck,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { VisaStatusBadge, Pill } from "@shared/components/rifah/badges";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { visaReferralApi } from "@shared/lib/api-services";

export function VisaReferralsList({ portalType = "user" }) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: applicationsData, isLoading, refetch } = useQuery({
    queryKey: ["my-visa-referrals"],
    queryFn: async () => {
      const res = await visaReferralApi.listMy();
      return res?.data || res || [];
    },
  });

  const applications = Array.isArray(applicationsData) ? applicationsData : [];

  const filteredApps = applications.filter((app) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      app.referenceNumber?.toLowerCase().includes(s) ||
      app.destinationCountry?.toLowerCase().includes(s) ||
      app.passportNumber?.toLowerCase().includes(s) ||
      app.companyName?.toLowerCase().includes(s) ||
      app.postalDispatch?.consignmentNumber?.toLowerCase().includes(s)
    );
  });

  return (
    <AppShell
      role={portalType === "biz" ? "business" : "user"}
      title="Visa Referrals Desk"
      subtitle="Chamber recommendation letters for overseas travel missions & exhibitions"
      actions={
        <Button asChild size="sm" className="gap-1.5 font-bold shrink-0 shadow-xs cursor-pointer">
          <Link href="/visa-referral">
            <Plus className="h-4 w-4" /> Apply for Visa Referral
          </Link>
        </Button>
      }
    >
      <div className="space-y-5">
        <Panel
          title="My Visa Applications"
          description="Track status, official tax invoices, and postal courier delivery for Chamber recommendations"
          action={
            <div className="relative w-64 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search country, ref, passport, AWB..."
                className="pl-8 h-8 text-xs bg-surface"
              />
            </div>
          }
        >
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                <p className="text-xs">Loading your visa referrals...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={Globe}
                  title="No Visa Referral Requests"
                  description="You haven't submitted any visa referral applications yet. Apply now to receive an official recommendation letter for your overseas business travel."
                  action={
                    <Button asChild size="sm" className="font-semibold gap-1.5 cursor-pointer mt-3">
                      <Link href="/visa-referral">
                        <Plus className="h-4 w-4" /> Apply for Visa Referral
                      </Link>
                    </Button>
                  }
                />
              </div>
            ) : (
        <div className="grid gap-4">
          {filteredApps.map((app) => (
            <div
              key={app._id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-2xs hover:border-primary/40 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-primary" />
                  <span className="font-bold text-sm text-foreground">
                    {app.destinationCountry}
                  </span>
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {app.referenceNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {app.invoiceNumber && (
                    <a
                      href={`/verify/invoice/${app.invoiceNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-lg hover:bg-sky-100 transition-colors"
                      title="View Official Tax Invoice"
                    >
                      <span>Invoice #{app.invoiceNumber} (₹{app.totalAmount || 590})</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <VisaStatusBadge status={app.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Passport:</span>
                  <p className="font-semibold font-mono text-foreground">{app.passportNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Company:</span>
                  <p className="font-semibold text-foreground truncate">{app.companyName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Travel Dates:</span>
                  <p className="font-medium text-foreground">
                    {app.travelDepartureDate ? new Date(app.travelDepartureDate).toLocaleDateString() : "—"} to{" "}
                    {app.travelReturnDate ? new Date(app.travelReturnDate).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Postal Destination:</span>
                  <p className="font-medium text-foreground truncate">
                    {app.postalAddress?.city ? `${app.postalAddress.city}, ${app.postalAddress.state}` : "Postal Address"}
                  </p>
                </div>
              </div>

              {app.purposeOfVisit && (
                <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2.5 rounded-xl border border-border">
                  {app.purposeOfVisit}
                </p>
              )}

              {/* Status Specific Highlights: Delivered by Post */}
              {app.status === "Delivered" && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                    <PackageCheck className="h-4 w-4 text-emerald-600" />
                    <span>Official Letter Physically Dispatched by Post / Courier</span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Courier / Post Provider:</span>
                      <strong>{app.postalDispatch?.courierProvider || "India Post (Speed Post)"}</strong>
                    </div>
                    {app.postalDispatch?.consignmentNumber && (
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Consignment / Tracking Number:</span>
                        <strong className="font-mono text-emerald-700 dark:text-emerald-300">{app.postalDispatch.consignmentNumber}</strong>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Dispatched Date:</span>
                      <strong>
                        {app.postalDispatch?.dispatchedDate
                          ? new Date(app.postalDispatch.dispatchedDate).toLocaleDateString()
                          : (app.deliveredAt ? new Date(app.deliveredAt).toLocaleDateString() : "Recently")}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-emerald-200 dark:border-emerald-800/50">
                    The original official physical letter printed on Chamber Letterhead with Chamber seal & signature has been dispatched to your postal address. Please check with your local postal delivery agent.
                  </p>
                </div>
              )}

              {app.status === "Rejected" && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                  <strong>Application Rejected:</strong> {app.rejectionReason || "Please verify your credentials or contact Central Secretariat."}
                </div>
              )}

              {app.status === "Pending" && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>Pending Central Secretariat Review (processed within 24–48 business hours)</span>
                </p>
              )}

              {app.status === "Approved" && (
                <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-purple-600" />
                  <span>Approved by Central Secretariat — Preparing hard copy on Chamber Letterhead for postal dispatch</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

export default VisaReferralsList;
