"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, MapPinned, Mail, Phone, ExternalLink, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { MembershipBadge, VerificationBadge, Pill } from "@shared/components/rifah/badges";
import { Button } from "@shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/components/ui/dialog";
import { businessApi, verificationApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";

export function AdminBusinessDetail({ id }) {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [verificationRecord, setVerificationRecord] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

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
        router.push("/admin/businesses");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBusiness();
  }, [id, router]);

  const handleToggleStatus = async () => {
    try {
      const newStatus = business.status === "active" ? "suspended" : "active";
      await businessApi.updateStatus(business._id, { status: newStatus });
      setBusiness((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Business ${newStatus === "active" ? "activated" : "suspended"}`);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <AppShell role="admin" title="Loading..." backTo="/admin/businesses">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  if (!business) return null;

  return (
    <AppShell 
      role="admin" 
      title={business.name} 
      subtitle={`${business.industry} · ${business.city}`}
      backTo="/admin/businesses"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Panel className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{business.name}</h2>
                <p className="text-muted-foreground">{business.tagline || "No tagline provided"}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/business/${business.slug || business._id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Public Profile
                </Link>
              </Button>
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
                onClick={handleToggleStatus}
              >
                {business.status === "active" ? "Suspend Business" : "Activate Business"}
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/20">
            <DialogTitle>{selectedDoc?.name || selectedDoc?.type}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100">
            {selectedDoc?.fileUrl && (
              <img 
                src={resolveMediaUrl(selectedDoc.fileUrl)} 
                alt={selectedDoc.name || "Document"} 
                className="max-w-full max-h-full object-contain shadow-sm border bg-white"
              />
            )}
          </div>

          <div className="p-4 border-t bg-background flex justify-end">
            <Button variant="outline" onClick={() => setSelectedDoc(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
