"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, MapPinned, Mail, Phone, ExternalLink, FileCheck2, Download, AlertTriangle, CheckCircle2, Loader2, Edit2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { MembershipBadge, VerificationBadge, Pill } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@shared/components/ui/dialog";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { businessApi, verificationApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { useAuth } from "@shared/providers/auth-provider";

export function AdminBusinessDetail({ id }) {
  const router = useRouter();
  const { user } = useAuth();
  const basePath = user?.role === "chapter_admin" ? "/chapter-admin" : user?.role === "state_admin" ? "/state-admin" : "/admin";
  const shellRole = user?.role === "state_admin" ? "state_admin" : "admin";

  const [business, setBusiness] = useState(null);
  const [verificationRecord, setVerificationRecord] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await businessApi.getByIdOrSlug(id);
        const businessData = response?.data || response;
        setBusiness(businessData);

        // Fetch verification queue documents if they exist
        try {
          const verRes = await verificationApi.getByBusinessId(businessData._id);
          const verData = verRes?.data || verRes;
          if (verData && verData.documents) {
             setVerificationRecord(verData);
          }
        } catch (e) {
          // Ignore if no verification record found
        }
      } catch (error) {
        toast.error("Failed to load business details");
        router.push(`${basePath}/businesses`);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBusiness();
  }, [id, router, basePath]);

  const handleToggleStatus = async () => {
    try {
      setStatusUpdating(true);
      const newStatus = business.status === "active" ? "suspended" : "active";
      await businessApi.updateStatus(business._id, { status: newStatus });
      setBusiness((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Business ${newStatus === "active" ? "activated" : "suspended"} successfully`);
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await businessApi.update(business._id, editData);
      setBusiness({ ...business, ...editData });
      toast.success("Business details updated successfully globally");
      setEditModalOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to update business");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = () => {
    setEditData({
      chapter: business.chapter || "",
      membershipTier: business.membershipTier || "",
      registrationType: business.registrationType || "",
      paymentStatus: business.paymentStatus || "",
      paymentMode: business.paymentMode || "",
      transactionId: business.transactionId || "",
      paymentAmount: business.paymentAmount || "",
      about: business.about || "",
      adminRemark: business.adminRemark || "",
    });
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <AppShell role={shellRole} title="Loading..." backTo={`${basePath}/businesses`}>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  if (!business) return null;

  return (
    <AppShell 
      role={shellRole} 
      title={business.name} 
      subtitle={`${business.industry} · ${business.city}`}
      backTo={`${basePath}/businesses`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Panel className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{business.name}</h2>
                <p className="text-muted-foreground">{business.tagline || "No tagline provided"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={openEditModal}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/business/${business.slug || business._id}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Public Profile
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="font-medium">{business.industry}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPinned className="h-4 w-4 text-muted-foreground" />
                  {business.city}, {business.state}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Chapter</p>
                <Pill>{business.chapter}</Pill>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    business.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>
                    {business.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <h3 className="text-lg font-semibold mb-4">About Business</h3>
            <p className="text-sm whitespace-pre-wrap">
              {business.about || "No description provided."}
            </p>
          </Panel>

          {(business.logo || business.coverImage || (business.gallery && business.gallery.length > 0)) && (
            <Panel className="p-6">
              <h3 className="text-lg font-semibold mb-4">Media & Profile Images</h3>
              
              <div className="space-y-6">
                {(business.logo || business.coverImage) && (
                  <div className="grid grid-cols-2 gap-4">
                    {business.logo && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Logo</p>
                        <div className="h-24 w-24 rounded-lg overflow-hidden border bg-white flex items-center justify-center">
                          <img 
                            src={resolveMediaUrl(business.logo)} 
                            alt="Logo" 
                            className="max-h-full max-w-full object-contain" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="text-xs text-muted-foreground">Image missing</span>';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {business.coverImage && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Cover Image</p>
                        <div className="h-24 w-full rounded-lg overflow-hidden border bg-slate-100 flex items-center justify-center">
                          <img 
                            src={resolveMediaUrl(business.coverImage)} 
                            alt="Cover" 
                            className="h-full w-full object-cover" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="text-xs text-muted-foreground">Image missing</span>';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {business.gallery && business.gallery.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Gallery ({business.gallery.length})</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {business.gallery.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg border overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 flex items-center justify-center" onClick={() => setSelectedDoc({ fileUrl: img, name: `Gallery Image ${idx+1}` })}>
                          <img 
                            src={resolveMediaUrl(img)} 
                            alt={`Gallery ${idx}`} 
                            className="h-full w-full object-cover" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="text-xs text-muted-foreground text-center px-2">Image missing from server</span>';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Verification & Plan</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Verification Status</p>
                <VerificationBadge status={business.verificationStatus || "pending"} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Membership</p>
                <MembershipBadge tier={business.membershipTier || "Free member"} />
              </div>
            </div>
          </Panel>

          {verificationRecord && verificationRecord.documents && verificationRecord.documents.length > 0 && (
            <Panel className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Submitted Documents</h3>
              <div className="space-y-3">
                {verificationRecord.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 border">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="min-w-0 truncate text-sm font-medium">{doc.name || doc.type}</span>
                    </div>
                    {doc.fileUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="text-xs text-primary hover:underline font-medium shrink-0"
                      >
                        View
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{business.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{business.phone || "No phone"}</span>
              </div>
            </div>
          </Panel>

          <Panel className="p-6 bg-muted/30">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Admin Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant={business.status === "active" ? "destructive" : "default"}
                onClick={() => setConfirmOpen(true)}
              >
                {business.status === "active" ? "Suspend Business" : "Activate Business"}
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl h-[88vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/20">
            <DialogTitle className="truncate pr-8">{selectedDoc?.name || selectedDoc?.type}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden p-3 flex flex-col items-center justify-center bg-slate-100">
            {selectedDoc?.fileUrl && (
              selectedDoc.fileUrl.toLowerCase().endsWith(".pdf") || selectedDoc.name?.toLowerCase().endsWith(".pdf") ? (
                <div className="w-full h-full flex flex-col relative">
                  <iframe
                    src={resolveMediaUrl(selectedDoc.fileUrl)}
                    title={selectedDoc.name || "PDF Document"}
                    className="w-full flex-1 border rounded-lg bg-white shadow-sm"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <a
                      href={resolveMediaUrl(selectedDoc.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/95 hover:bg-white border shadow-sm text-foreground backdrop-blur transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open Fullscreen ↗
                    </a>
                  </div>
                </div>
              ) : (
                <img 
                  src={resolveMediaUrl(selectedDoc.fileUrl)} 
                  alt={selectedDoc.name || "Document"} 
                  className="max-w-full max-h-full object-contain shadow-sm border bg-white rounded-lg"
                />
              )
            )}
          </div>

          <div className="p-4 border-t bg-background flex items-center justify-between">
            {selectedDoc?.fileUrl ? (
              <div className="flex items-center gap-3">
                <a
                  href={resolveMediaUrl(selectedDoc.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open PDF in new tab ↗
                </a>
                <span className="text-muted-foreground text-xs">•</span>
                <a
                  href={resolveMediaUrl(selectedDoc.fileUrl)}
                  download={selectedDoc.name || "document.pdf"}
                  className="text-xs font-semibold text-muted-foreground hover:underline inline-flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
              </div>
            ) : <span />}
            <Button variant="outline" onClick={() => setSelectedDoc(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend / Activate Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-[440px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${business.status === "active" ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"}`}>
                {business.status === "active" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <AlertDialogTitle className="text-lg font-bold">
                {business.status === "active" ? "Suspend Business" : "Activate Business"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
              {business.status === "active" ? (
                <>
                  Are you sure you want to suspend <strong className="text-foreground">{business.name}</strong>? 
                  Once suspended, this business will not be visible to members or publicly listed in the directory.
                </>
              ) : (
                <>
                  Are you sure you want to activate <strong className="text-foreground">{business.name}</strong>? 
                  Once activated, this business will be restored and listed publicly in the directory.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={statusUpdating} onClick={() => setConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={statusUpdating}
              onClick={(e) => {
                e.preventDefault();
                handleToggleStatus();
              }}
              className={business.status === "active" 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"}
            >
              {statusUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {statusUpdating 
                ? (business.status === "active" ? "Suspending..." : "Activating...") 
                : (business.status === "active" ? "Yes, Suspend" : "Yes, Activate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Edit Business Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chapter</Label>
                <Input 
                  value={editData.chapter} 
                  onChange={(e) => setEditData({...editData, chapter: e.target.value})} 
                  placeholder="e.g. Pune Chapter"
                />
              </div>
              <div className="space-y-2">
                <Label>Membership Plan</Label>
                <Select value={editData.membershipTier} onValueChange={(val) => setEditData({...editData, membershipTier: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free member">Free Member</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                    <SelectItem value="Diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Registration Type</Label>
                <Select value={editData.registrationType} onValueChange={(val) => setEditData({...editData, registrationType: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="event">Event Registration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3">Payment Details</h4>
              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select value={editData.paymentMode} onValueChange={(val) => setEditData({...editData, paymentMode: val})}>
                    <SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI / QR</SelectItem>
                      <SelectItem value="Net Banking">Net Banking</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transaction ID</Label>
                  <Input 
                    value={editData.transactionId} 
                    onChange={(e) => setEditData({...editData, transactionId: e.target.value})} 
                    placeholder="TXN..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input 
                    type="number"
                    value={editData.paymentAmount} 
                    onChange={(e) => setEditData({...editData, paymentAmount: e.target.value})} 
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="space-y-2">
                <Label>About Business</Label>
                <Textarea 
                  value={editData.about} 
                  onChange={(e) => setEditData({...editData, about: e.target.value})} 
                  placeholder="Describe the business..."
                  rows={4}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="space-y-2 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900/50">
                <Label className="text-orange-800 dark:text-orange-400 font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> 
                  Admin Remark (Visible to Business Owner)
                </Label>
                <Textarea 
                  value={editData.adminRemark} 
                  onChange={(e) => setEditData({...editData, adminRemark: e.target.value})} 
                  placeholder="Enter remarks or instructions for the business owner here (e.g., 'Please upload GST document')..."
                  rows={3}
                  className="bg-white dark:bg-background border-orange-200 dark:border-orange-900/50"
                />
                <p className="text-xs text-orange-700/80 dark:text-orange-400/80">
                  Whatever you write here will be displayed on the user's dashboard.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
