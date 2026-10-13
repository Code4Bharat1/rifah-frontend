"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Mail,
  Send,
  Calendar,
  Building2,
  User,
  Phone,
  Paperclip,
  Check,
  Shield,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  XCircle,
  Plane,
  Truck,
  PackageCheck,
  Copy,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { VisaStatusBadge, Pill } from "@shared/components/rifah/badges";
import { AppShell } from "@shared/components/rifah/app-shell";
import { StatCard, Panel } from "@shared/components/rifah/ui-bits";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { visaReferralApi } from "@shared/lib/api-services";
import { cn } from "@shared/lib/utils";

const COURIER_PROVIDERS = [
  "India Post (Speed Post)",
  "India Post (Registered Post)",
  "Blue Dart Express",
  "DTDC Courier",
  "The Professional Couriers",
  "DHL Express",
  "FedEx",
  "Trackon Courier",
  "Delhivery",
  "Hand Delivery / Official Messenger",
  "Other Courier Service",
];

export function AdminVisaReferrals() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Modal / Drawer states
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Status update form inside detail drawer
  const [newStatus, setNewStatus] = useState("Pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Postal Dispatch Form state
  const [deliveryForm, setDeliveryForm] = useState({
    letterNumber: "",
    courierProvider: "India Post (Speed Post)",
    consignmentNumber: "",
    dispatchedDate: new Date().toISOString().split("T")[0],
    signerName: "Secretary General",
    signerTitle: "Authorized Signatory, RIFAH Chamber of Commerce",
    postalNotes: "Dispatched in sealed official Chamber envelope via Registered Post.",
  });
  const [isDelivering, setIsDelivering] = useState(false);

  // 1. Fetch Stats
  const { data: statsData } = useQuery({
    queryKey: ["admin-visa-referrals-stats"],
    queryFn: async () => {
      const res = await visaReferralApi.getStats();
      return res?.data || res || {};
    },
  });

  // 2. Fetch Applications
  const {
    data: applicationsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-visa-referrals", page, statusFilter, countryFilter, searchTerm],
    queryFn: async () => {
      const params = {
        page,
        limit: 15,
        search: searchTerm || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        destinationCountry: countryFilter !== "All" ? countryFilter : undefined,
      };
      const res = await visaReferralApi.listAdmin(params);
      return res?.data || res?.items || res || [];
    },
  });

  const applications = Array.isArray(applicationsData)
    ? applicationsData
    : applicationsData?.items || [];
  const pagination = applicationsData?.pagination || {};

  // Open Details Modal
  const handleOpenDetail = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status || "Pending");
    setAdminNotes(app.adminNotes || "");
    setRejectionReason(app.rejectionReason || "");
    setDetailModalOpen(true);
  };

  // Open Postal Dispatch Modal
  const handleOpenDelivery = (app) => {
    setSelectedApp(app);
    const countryCode = (app.destinationCountry || "GEN").slice(0, 3).toUpperCase();
    const defaultLetterNum = `RIFAH/VISA/${countryCode}/${Date.now().toString().slice(-5)}`;
    setDeliveryForm({
      letterNumber: app.referralLetter?.letterNumber || defaultLetterNum,
      courierProvider: app.postalDispatch?.courierProvider || "India Post (Speed Post)",
      consignmentNumber: app.postalDispatch?.consignmentNumber || "",
      dispatchedDate: app.postalDispatch?.dispatchedDate
        ? new Date(app.postalDispatch.dispatchedDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      signerName: app.referralLetter?.signerName || "Secretary General",
      signerTitle: app.referralLetter?.signerTitle || "Authorized Signatory, RIFAH Chamber of Commerce",
      postalNotes: app.postalDispatch?.postalNotes || "Dispatched in sealed official Chamber envelope via Registered Post.",
    });
    setDeliveryModalOpen(true);
  };

  // Status Change
  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    setIsUpdatingStatus(true);
    try {
      await visaReferralApi.updateStatus(selectedApp._id, {
        status: newStatus,
        adminNotes,
        rejectionReason: newStatus === "Rejected" ? rejectionReason : "",
      });
      toast.success(`Application status updated to ${newStatus}`);
      queryClient.invalidateQueries(["admin-visa-referrals"]);
      queryClient.invalidateQueries(["admin-visa-referrals-stats"]);
      setDetailModalOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Dispatch Referral Letter by Post
  const handleDeliverSubmit = async (e) => {
    e.preventDefault();

    if (!deliveryForm.letterNumber.trim()) {
      toast.error("Please provide the Chamber Letter Reference Number.");
      return;
    }

    setIsDelivering(true);
    try {
      await visaReferralApi.deliverLetter(selectedApp._id, deliveryForm);
      toast.success(`Referral letter marked as physically dispatched via ${deliveryForm.courierProvider}!`);
      queryClient.invalidateQueries(["admin-visa-referrals"]);
      queryClient.invalidateQueries(["admin-visa-referrals-stats"]);
      setDeliveryModalOpen(false);
      setDetailModalOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to record postal dispatch");
    } finally {
      setIsDelivering(false);
    }
  };

  const copyPostalAddress = (app) => {
    if (!app) return;
    const addr = app.postalAddress || {};
    const text = [
      addr.recipientName || app.fullName,
      addr.addressLine1,
      addr.addressLine2,
      addr.landmark ? `Landmark: ${addr.landmark}` : "",
      `${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`.trim().replace(/^,\s*/, ""),
      `Phone: ${addr.contactPhone || app.phone}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast.success("Postal address label copied to clipboard!");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <AppShell
      role="admin"
      title="Visa Referrals Desk"
      subtitle="Diplomatic consular recommendation letters & postal dispatch (Central Admin Only)"
      actions={
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <Clock className="h-3.5 w-3.5" /> Refresh Desk
        </Button>
      }
    >
      <div className="space-y-5">
        {/* ── STATS CARDS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total Requests"
            value={String(statsData?.total ?? 0)}
            icon={Globe}
            tone="primary"
            active={statusFilter === "All"}
            onClick={() => setStatusFilter("All")}
          />
          <StatCard
            label="Pending Review"
            value={String(statsData?.pending ?? 0)}
            icon={Clock}
            tone="warning"
            active={statusFilter === "Pending"}
            onClick={() => setStatusFilter("Pending")}
          />
          <StatCard
            label="In Progress"
            value={String(statsData?.inProgress ?? 0)}
            icon={Sparkles}
            tone="info"
            active={statusFilter === "In Progress"}
            onClick={() => setStatusFilter("In Progress")}
          />
          <StatCard
            label="Approved"
            value={String(statsData?.approved ?? 0)}
            icon={CheckCircle2}
            tone="success"
            active={statusFilter === "Approved"}
            onClick={() => setStatusFilter("Approved")}
          />
          <StatCard
            label="Delivered by Post"
            value={String(statsData?.delivered ?? 0)}
            icon={Truck}
            tone="brand"
            active={statusFilter === "Delivered"}
            onClick={() => setStatusFilter("Delivered")}
          />
          <StatCard
            label="Rejected"
            value={String(statsData?.rejected ?? 0)}
            icon={XCircle}
            tone="danger"
            active={statusFilter === "Rejected"}
            onClick={() => setStatusFilter("Rejected")}
          />
        </div>

        {/* ── APPLICATIONS TABLE PANEL ───────────────────────────────── */}
        <Panel
          title="Visa Referral Applications"
          description="Review applicant credentials and record postal dispatch for approved Chamber recommendation letters"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reference, applicant, passport, city..."
                  className="pl-8 h-8 text-xs bg-surface"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-8 text-xs bg-surface">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Delivered">Delivered (By Post)</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== "All" || countryFilter !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setCountryFilter("All");
                  }}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </Button>
              )}
            </div>
          }
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
              <p className="text-xs">Loading visa referral applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Globe}
                title="No Visa Referral Applications Found"
                description={
                  searchTerm || statusFilter !== "All"
                    ? "There are currently no visa referral requests matching your filter criteria."
                    : "No visa referral requests have been submitted yet."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ref & Invoice</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Country & Purpose</th>
                    <th className="py-3 px-4">Postal Destination</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-mono font-bold text-primary">{app.referenceNumber}</p>
                        {app.invoiceNumber ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <a
                              href={`/verify/invoice/${app.invoiceNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[10px] text-sky-700 dark:text-sky-300 font-semibold hover:underline"
                            >
                              INV: #{app.invoiceNumber}
                            </a>
                            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1 rounded">
                              ₹590 (18% GST)
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">₹590 Central Account</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{app.fullName}</p>
                        {app.email && <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{app.email}</p>}
                        {app.phone && <p className="text-[11px] text-muted-foreground font-mono">{app.phone}</p>}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{app.destinationCountry}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{app.purposeOfVisit}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground truncate max-w-[170px]">
                          {app.postalAddress?.city ? `${app.postalAddress.city}, ${app.postalAddress.state}` : "—"}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          PIN: {app.postalAddress?.pincode || "—"}
                        </p>
                        {app.postalDispatch?.consignmentNumber && (
                          <span className="inline-block mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-300 font-mono font-semibold">
                            AWB: {app.postalDispatch.consignmentNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <VisaStatusBadge status={app.status} />
                      </td>

                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDetail(app)}
                            className="h-7 text-xs gap-1 font-semibold cursor-pointer"
                          >
                            <Eye className="h-3 w-3" /> View Details
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleOpenDelivery(app)}
                            className="h-7 text-xs gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                          >
                            <Truck className="h-3 w-3" /> Dispatch by Post
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* ── DETAIL & STATUS CHANGE MODAL ───────────────────────────── */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <span>Visa Referral: {selectedApp.fullName}</span>
                      <VisaStatusBadge status={selectedApp.status} />
                    </DialogTitle>
                    <DialogDescription className="text-xs font-mono text-primary font-semibold mt-0.5">
                      Ref: {selectedApp.referenceNumber} · Destination: {selectedApp.destinationCountry}
                    </DialogDescription>
                  </div>
                  {selectedApp.invoiceNumber && (
                    <a
                      href={`/verify/invoice/${selectedApp.invoiceNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      <span>Invoice #{selectedApp.invoiceNumber} (₹590 Central Account)</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </DialogHeader>

              {/* Physical Postal Delivery Address Box */}
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-primary/20">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Physical Postal Delivery Destination (For Official Letter)</span>
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyPostalAddress(selectedApp)}
                    className="h-6 text-[11px] gap-1 cursor-pointer font-semibold"
                  >
                    {copiedAddress ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedAddress ? "Copied" : "Copy Postal Label"}</span>
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-foreground">
                  <div>
                    <p><span className="text-muted-foreground">Recipient Name:</span> <strong>{selectedApp.postalAddress?.recipientName || selectedApp.fullName}</strong></p>
                    <p><span className="text-muted-foreground">Address:</span> {selectedApp.postalAddress?.addressLine1 || selectedApp.residentialAddress || "—"}</p>
                    {selectedApp.postalAddress?.addressLine2 && <p className="text-muted-foreground pl-12">{selectedApp.postalAddress.addressLine2}</p>}
                    {selectedApp.postalAddress?.landmark && <p><span className="text-muted-foreground">Landmark:</span> {selectedApp.postalAddress.landmark}</p>}
                  </div>
                  <div>
                    <p><span className="text-muted-foreground">City & State:</span> <strong>{selectedApp.postalAddress?.city || selectedApp.city || "—"}, {selectedApp.postalAddress?.state || selectedApp.state || "—"}</strong></p>
                    <p><span className="text-muted-foreground">PIN Code:</span> <strong className="font-mono">{selectedApp.postalAddress?.pincode || selectedApp.pincode || "—"}</strong></p>
                    <p><span className="text-muted-foreground">Courier Mobile:</span> <strong>{selectedApp.postalAddress?.contactPhone || selectedApp.phone || "—"}</strong></p>
                  </div>
                </div>
              </div>

              {/* Postal Dispatch Status (If Delivered) */}
              {selectedApp.status === "Delivered" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <PackageCheck className="h-4 w-4 text-emerald-600" />
                    <span>Physically Dispatched by Post / Courier</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <p><span className="text-muted-foreground">Courier Provider:</span> <strong>{selectedApp.postalDispatch?.courierProvider || "Registered Post"}</strong></p>
                    <p><span className="text-muted-foreground">Consignment / AWB No:</span> <strong className="font-mono">{selectedApp.postalDispatch?.consignmentNumber || "N/A"}</strong></p>
                    <p><span className="text-muted-foreground">Dispatch Date:</span> {selectedApp.postalDispatch?.dispatchedDate ? new Date(selectedApp.postalDispatch.dispatchedDate).toLocaleDateString() : (selectedApp.deliveredAt ? new Date(selectedApp.deliveredAt).toLocaleDateString() : "—")}</p>
                    <p><span className="text-muted-foreground">Chamber Letter Ref:</span> <strong className="font-mono">{selectedApp.referralLetter?.letterNumber || "—"}</strong></p>
                  </div>
                  {selectedApp.postalDispatch?.postalNotes && (
                    <p className="text-[11px] text-emerald-900 dark:text-emerald-200 bg-white/60 dark:bg-black/20 p-2 rounded">
                      <strong>Postal Remarks:</strong> {selectedApp.postalDispatch.postalNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Applicant & Visit Information */}
              <div className="grid sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border text-xs">
                <div>
                  <h4 className="font-bold text-foreground text-xs border-b border-border pb-1 mb-2">
                    Applicant Information
                  </h4>
                  <p><span className="text-muted-foreground">Full Name:</span> <strong>{selectedApp.fullName}</strong></p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedApp.email || "—"}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedApp.phone || "—"}</p>
                  <p><span className="text-muted-foreground">Nationality:</span> {selectedApp.nationality || "Indian"}</p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground text-xs border-b border-border pb-1 mb-2">
                    Visit Specifications
                  </h4>
                  <p><span className="text-muted-foreground">Country of Visit:</span> <strong className="text-primary">{selectedApp.destinationCountry}</strong></p>
                  <p><span className="text-muted-foreground">Purpose of Visit:</span> <strong>{selectedApp.purposeOfVisit}</strong></p>
                  <p><span className="text-muted-foreground">Application Fee:</span> <strong className="text-emerald-700 dark:text-emerald-300">₹590 (₹500 + 18% GST Paid - Central Account)</strong></p>
                  <p><span className="text-muted-foreground">Invoice No:</span> <strong className="font-mono">#{selectedApp.invoiceNumber || "INV-NONE"}</strong></p>
                </div>
              </div>

              {/* Detailed Description of Visit */}
              <div className="bg-muted/20 p-4 rounded-xl border border-border text-xs space-y-1.5">
                <span className="text-muted-foreground font-semibold">Detailed Description of Visit:</span>
                <p className="mt-1 bg-surface p-3 rounded-lg border border-border leading-relaxed text-foreground whitespace-pre-line text-xs">
                  {selectedApp.detailedDescriptionOfVisit || selectedApp.purposeOfVisit}
                </p>
              </div>

              {/* Four Mandatory Documents */}
              <div>
                <h4 className="font-bold text-foreground text-xs mb-2">Four Mandatory Verification Documents</h4>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {selectedApp.aadharCardUrl ? (
                    <a
                      href={selectedApp.aadharCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:bg-muted/40 transition-colors text-primary font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                        <span>1. Aadhar Card</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-border bg-muted/20 text-muted-foreground flex items-center justify-between">
                      <span>1. Aadhar Card</span>
                      <span className="text-[10px] text-red-500 font-bold">Missing</span>
                    </div>
                  )}

                  {selectedApp.panCardUrl ? (
                    <a
                      href={selectedApp.panCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:bg-muted/40 transition-colors text-primary font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                        <span>2. PAN Card</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-border bg-muted/20 text-muted-foreground flex items-center justify-between">
                      <span>2. PAN Card</span>
                      <span className="text-[10px] text-red-500 font-bold">Missing</span>
                    </div>
                  )}

                  {selectedApp.passportDocUrl || selectedApp.passportFrontUrl ? (
                    <a
                      href={selectedApp.passportDocUrl || selectedApp.passportFrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:bg-muted/40 transition-colors text-primary font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                        <span>3. Passport</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-border bg-muted/20 text-muted-foreground flex items-center justify-between">
                      <span>3. Passport</span>
                      <span className="text-[10px] text-red-500 font-bold">Missing</span>
                    </div>
                  )}

                  {selectedApp.addressProofUrl ? (
                    <a
                      href={selectedApp.addressProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:bg-muted/40 transition-colors text-primary font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                        <span>4. Address Proof</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-border bg-muted/20 text-muted-foreground flex items-center justify-between">
                      <span>4. Address Proof</span>
                      <span className="text-[10px] text-red-500 font-bold">Missing</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
                <h4 className="font-bold text-foreground text-xs">Update Application Status</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Change Status To</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress (Reviewing)</SelectItem>
                        <SelectItem value="Approved">Approved (Ready for Letterhead Print)</SelectItem>
                        <SelectItem value="Delivered">Delivered (Dispatched by Post)</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Secretariat Notes (Internal)</Label>
                    <Input
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Letter printed on chamber letterhead; verified"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                {newStatus === "Rejected" && (
                  <div>
                    <Label className="text-xs font-semibold text-rose-600">Rejection Reason (Shared with Applicant)</Label>
                    <Input
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain reason for rejection..."
                      className="mt-1 text-xs border-rose-300"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={isUpdatingStatus}
                    size="sm"
                    className="font-bold text-xs cursor-pointer"
                  >
                    {isUpdatingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Save Status Change
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setDetailModalOpen(false);
                      handleOpenDelivery(selectedApp);
                    }}
                    size="sm"
                    className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer"
                  >
                    <Truck className="h-3.5 w-3.5" /> Dispatch by Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── DISPATCH REFERRAL LETTER BY POST MODAL ─────────────────── */}
      <Dialog open={deliveryModalOpen} onOpenChange={setDeliveryModalOpen}>
        <DialogContent className="max-w-xl">
          {selectedApp && (
            <form onSubmit={handleDeliverSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  <span>Dispatch Official Referral Letter by Post</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Record physical postal dispatch details. The original letter printed on official Chamber Letterhead is dispatched by post. An advisory email with tracking info will be sent to <strong>{selectedApp.email}</strong>.
                </DialogDescription>
              </DialogHeader>

              {/* Delivery Address Reminder */}
              <div className="bg-muted/40 border border-border p-3 rounded-xl text-xs space-y-1">
                <span className="text-muted-foreground font-semibold">Destination Postal Address:</span>
                <p className="font-semibold text-foreground">
                  {selectedApp.postalAddress?.recipientName || selectedApp.fullName}
                </p>
                <p className="text-muted-foreground">
                  {selectedApp.postalAddress?.addressLine1 || selectedApp.residentialAddress || ""}
                  {selectedApp.postalAddress?.addressLine2 ? `, ${selectedApp.postalAddress.addressLine2}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {selectedApp.postalAddress?.city || selectedApp.city || ""}, {selectedApp.postalAddress?.state || selectedApp.state || ""} - {selectedApp.postalAddress?.pincode || selectedApp.pincode || ""}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs font-semibold">Chamber Letter Reference Number (On Letterhead) *</Label>
                  <Input
                    value={deliveryForm.letterNumber}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, letterNumber: e.target.value }))}
                    placeholder="e.g. RIFAH/VISA/SAU/2026/089"
                    required
                    className="mt-1 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Postal / Courier Provider *</Label>
                    <Select
                      value={deliveryForm.courierProvider}
                      onValueChange={(val) => setDeliveryForm((prev) => ({ ...prev, courierProvider: val }))}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COURIER_PROVIDERS.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Consignment / Postal Tracking No (AWB)</Label>
                    <Input
                      value={deliveryForm.consignmentNumber}
                      onChange={(e) => setDeliveryForm((prev) => ({ ...prev, consignmentNumber: e.target.value }))}
                      placeholder="e.g. EM123456789IN / 14892482"
                      className="mt-1 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Date of Postal Dispatch</Label>
                    <Input
                      type="date"
                      value={deliveryForm.dispatchedDate}
                      onChange={(e) => setDeliveryForm((prev) => ({ ...prev, dispatchedDate: e.target.value }))}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Authorized Signer Name</Label>
                    <Input
                      value={deliveryForm.signerName}
                      onChange={(e) => setDeliveryForm((prev) => ({ ...prev, signerName: e.target.value }))}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Authorized Signer Title</Label>
                  <Input
                    value={deliveryForm.signerTitle}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, signerTitle: e.target.value }))}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Postal Remarks / Delivery Notes</Label>
                  <Textarea
                    rows={2}
                    value={deliveryForm.postalNotes}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, postalNotes: e.target.value }))}
                    placeholder="e.g. Dispatched in sealed waterproof envelope via Speed Post."
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeliveryModalOpen(false)}
                  disabled={isDelivering}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isDelivering || !deliveryForm.letterNumber}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm cursor-pointer"
                >
                  {isDelivering ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Recording Dispatch...
                    </>
                  ) : (
                    <>
                      <Truck className="h-3.5 w-3.5" /> Confirm Dispatch & Mark Delivered
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default AdminVisaReferrals;
